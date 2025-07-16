const {PrismaClient} = require('@prisma/client');
const prisma= new PrismaClient();
const axios = require('axios')

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const callGemini = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  } catch (error) {
    console.error("❌ Gemini API Error:", error.response?.data || error.message);
    throw error;
  }
};

const CreateUser = async(req,res)=>{
    try{
        console.log("🔥 /user/init HIT");
        console.log("Request body:", req.body);
        const {email,name}=req.body;
        
        if (!email||!name){
            return res.status(400).json({message:'Email and name are required.'})
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user){
            user = await prisma.user.create({
                data: {email,name},
            });

            
        }
        return res.status(200).json({ message: 'User initialized successfully' });
    }
    catch(error){
        console.error('Error initializing user:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const saveUserProfile = async(req,res)=>{
    try{
        console.log('⚡ Reached saveUserProfile');
        console.log('Request body:', req.body);
        console.log('Decoded user:', req.user); 
        const{
            email,
            name,
            age,
            role,
            income,
            hasHealthInsurance,
            hasEducationLoan,
            hasPPF,
            hasNPS,
            hasLifeInsurance,
            hasFD
        } = req.body;

        let user = await prisma.user.findUnique({where:{email}});

        if (!user)
        {
            console.log('🟡 Creating new user...');
            user = await prisma.user.create({
                data:{email,name}
            });
        }
        else 
        {
        console.log('🟢 User already exists:', user.email);
        }

        const toBool = (val) => val?.toLowerCase() === 'yes';

        await prisma.userProfile.upsert({
            where: {userId: user.id},
            update:{
                age:parseInt(age),
                role,
                income:parseInt(income),
                hasHealthInsurance: toBool(hasHealthInsurance),
                hasEducationLoan: toBool(hasEducationLoan),
                hasPPF: toBool(hasPPF),
                hasNPS: toBool(hasNPS),
                hasLifeInsurance: toBool(hasLifeInsurance),
                hasFD: toBool(hasFD),
            },
            create: {
                userId: user.id,
                age:parseInt(age),
                role,
                income:parseInt(income),
                hasHealthInsurance: toBool(hasHealthInsurance),
                hasEducationLoan: toBool(hasEducationLoan),
                hasPPF: toBool(hasPPF),
                hasNPS: toBool(hasNPS),
                hasLifeInsurance: toBool(hasLifeInsurance),
                hasFD: toBool(hasFD),           }
        })

        res.status(200).json({
            message:'Profile has been created.'
        })
    }
    catch(error)
    {
        console.error('❌ Error in saveUserProfile:', error);
        console.error('Error:',error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const generateTax =async(req,res)=>{
    try{

        const {email} = req.body;
        if (!email){
            return res.status(400).json({message:'Email is required.'})
        }

        const user = await prisma.user.findUnique({where:{email}});
        if (!user){
            return res.status(400).json({message:'User not found.'})
        }

        const profile = await prisma.userProfile.findUnique({where: { userId: user.id }});

          if (!profile) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        const {age,role,income,hasPPF,hasNPS,hasHealthInsurance,hasEducationLoan,hasLifeInsurance} = profile;

        let totalDeductions = 0;
        const deductions = [];

        if (hasPPF) {
            totalDeductions += 150000;
            deductions.push("PPF (₹1.5L)");
        }
        if (hasNPS) {
            totalDeductions += 50000;
            deductions.push("NPS (₹50k)");
        }
        if (hasHealthInsurance) {
            totalDeductions += 25000;
            deductions.push("Health Insurance (₹25k)");
        }
        if (hasEducationLoan) {
            totalDeductions += 75000;
            deductions.push("Education Loan Interest (₹75k)");
        }
        if (hasLifeInsurance) {
            totalDeductions += 50000;
            deductions.push("Life Insurance Premium (₹50k)");
        }

        const taxableIncome = Math.max(income - totalDeductions, 0);

        const prompt = `
                A ${age}-year-old ${role} in India earns ₹${income.toLocaleString()}/year and claims deductions for ${deductions.length > 0 ? deductions.join(', ') : 'none'}.

                Your task is to act as an Indian income tax planner and perform a **step-by-step income tax comparison** for FY 2024–25.  
                **Do not assume, invent, or infer** any tax rules or deductions outside of what is explicitly provided below.

                ---

                 Step-by-Step Instructions (Strictly follow this order and explain your reasoning at each step):

                 1. Deductions (Old Regime Only)
                - For each claimed deduction, mention the valid Income Tax Act section (e.g., 80C for PPF, 80D for health insurance).
                - Only use deductions that are **explicitly recognized under Indian tax law**.
                - If any claimed deduction is **not valid**, state that and ignore it in calculations.
                - **Clearly list** all valid deductions and compute the **total deduction amount**.

                 2. Old Regime Tax Calculation
                - Compute **Taxable Income**: Gross Income – Total Deductions.
                - Then calculate tax **slab by slab** using the following:

                    - Up to ₹2.5 lakh: Nil  
                    - ₹2.5 lakh – ₹5 lakh: 5%  
                    - ₹5 lakh – ₹10 lakh: 20%  
                    - Above ₹10 lakh: 30%

                - Show exact tax amount for **each slab** separately.
                - If Taxable Income is ≤ ₹5,00,000, apply **Section 87A rebate** to reduce final tax to ₹0.
                - Show the **final tax under the Old Regime**.

                 3.  New Regime Tax Calculation
                - No deductions allowed.
                - Taxable Income = Gross Income.
                - Use these slabs:

                    - Up to ₹3 lakh: Nil  
                    - ₹3 lakh – ₹6 lakh: 5%  
                    - ₹6 lakh – ₹9 lakh: 10%  
                    - ₹9 lakh – ₹12 lakh: 15%  
                    - ₹12 lakh – ₹15 lakh: 20%  
                    - Above ₹15 lakh: 30%

                - Again, calculate tax for each slab **separately and clearly**.
                - Apply **Section 87A rebate** only if taxable income is ≤ ₹5,00,000.
                - Show the **final tax under the New Regime**.

                4. Regime Comparison
                - Present total tax under both regimes.
                - Clearly state which regime results in lower tax and by how much.
                - Briefly explain **why** that regime is more beneficial.

                5. Beginner-Friendly Financial Advice
                 - Provide 2–3 short, helpful tips based on their profile. Examples:
                 - Invest under Section 80C to save tax.
                 - Consider NPS or ELSS for long-term growth and deductions.
                 - Build an emergency fund or get health insurance.

                Output Rules
               - Use clear bullet points and structured formatting.
               - Use Indian Rupee symbol and comma-separated values (e.g., ₹2,50,000).
               - Ensure all numbers are accurate and calculations make logical sense.
               - **Do not skip any step** or summarize prematurely.
               - If any step doesn’t apply (e.g., invalid deductions), clearly say so and proceed.

               ---

               If taxable income is **very high (e.g., above ₹30 lakh)** and the computed tax is **suspiciously low**, re-check all steps.  
               Double-check slab logic and deduction math. If unsure, add a disclaimer.`.trim();
        
        console.log('🧠 Prompt:', prompt);

        try{const aiResponse = await callGemini(prompt);;

        res.status(200).json({
            originalIncome: income,
            deductionsApplied: deductions,
            estimatedTaxableIncome: taxableIncome,
            summary: aiResponse,
        });
    }catch(llmError){
        console.error('❌ Failed to call LLM:', llmError);
        return res.status(500).json({ message: 'Failed to generate tax summary from AI' });}
    }
    catch (error)
    {
        console.error('Error generating tax summary:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const answerQuestions=async(req,res)=>{
    try{
        const {email,question}=req.body;

        if (!email || ! question ){
            return res.status(400).json({message:'Email and question are required.'})
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const prompt = `You are TaxGPT — a reliable and friendly AI financial assistant built specifically for Indian students, freelancers, and early earners.

                        Your task is to answer the following tax or personal finance question using **only verified Indian tax rules and current financial year (FY 2024–25)** data:

                        "${question}"

                        Follow these guidelines:
                        - **Be accurate**: If you're unsure or information is not explicitly available in the prompt, say so or suggest checking with a tax professional.
                        - **Be concise and beginner-friendly**: Avoid jargon, and explain using simple words.
                        - **Contextualize**: If the user's role (e.g., student/freelancer/fresher) affects the answer, address it.
                        - **Structure**:
                          - Start with a 1–2 line summary.
                          - Use bullet points for key info or breakdowns.
                          - End with 1–2 actionable tips if relevant.

                        Restrictions:
                        - Do **not make up tax rules, slabs, or deductions**. Only use actual Indian tax laws.
                        - Do **not provide legal or investment advice** beyond general guidance.
                        - Always assume the financial year is **2024–25**, unless otherwise stated.

                        Keep your tone warm, helpful, and focused on delivering clear value.`.trim();

        const aiResponse = await callGemini(prompt);

        res.status(200).json({ answer: aiResponse });
    }
    catch (error){
        console.error('Error answering question:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }

}

const getContentByRole = async (req, res) => {
  try {
    console.log("🔥 /api/learn/content HIT");
    console.log("Decoded user from token:", req.user);
   
    const email = req.user.email;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    if (!profile || !profile.role) {
      return res.status(404).json({ message: 'User role not found.' });
    }

    const role = profile.role.toLowerCase(); 

    const redirectMap = {
      student: './collegeS/collegeS.html',
      freelancer:  './freelancer/freelancer.html' ,
      'corporate_fresher': './corporate/corporate.html'
    };

    const redirectTo = redirectMap[role];

    if (!redirectTo) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    res.status(200).json({ redirectTo });

  } catch (error) {
    console.error('Error determining role route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports={CreateUser,saveUserProfile,generateTax,answerQuestions,getContentByRole}
