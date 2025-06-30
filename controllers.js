const {PrismaClient} = require('@prisma/client');
const prisma= new PrismaClient();
const axios = require('axios')

const callGroq = async (prompt) => {
    try{
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, //this will control creativity 
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.choices[0].message.content;
}catch(error){
    console.error('❌ Groq API Error:', error.response?.data || error);
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

                Your task:
                1. Calculate total deductions with relevant Income Tax Act sections (e.g., 80C for PPF, 80E for education loan).
                2. Under the **Old Regime**, apply deductions and show:
                   - Total deductions
                   - Taxable income
                   - Final income tax (based on FY 2024–25 slabs)
                3. Under the **New Regime**, assume no deductions and show:
                   - Taxable income
                   - Final tax (based on FY 2024–25 slabs)
                4. Clearly state which regime is better (saves more tax).
                5. Suggest 2–3 lines of beginner-friendly financial advice based on their profile.
                
                Use clear bullet points and Indian Rupee amounts. Keep tone helpful and easy for young earners to understand.
                `.trim();
        
        console.log('🧠 Prompt:', prompt);

        try{const aiResponse = await callGroq(prompt);

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

        const prompt = `You are TaxGPT — a friendly and reliable financial assistant designed for Indian students, freelancers, and early earners.
        Your job is to answer the following finance or tax-related question in a clear, beginner-friendly manner using accurate Indian context:"${question}"
        Be concise, avoid jargon, and explain in everyday terms. 
        If the answer depends on the user's role (student/fresher/freelancer), mention that. 
        Use bullet points or short paragraphs if helpful. Avoid filler language and focus on useful, actionable insights.`.trim();

        const aiResponse = await callGroq(prompt);

        res.status(200).json({ answer: aiResponse });
    }
    catch (error){
        console.error('Error answering question:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }

}

const getContentByRole = async (req, res) => {
  try {
    const { email } = req.body;

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
      'corporate fresher': './corporate.html'
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