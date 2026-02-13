import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Substitua pela sua chave da OpenAI
const OPENAI_API_KEY = "SUA_API_KEY";

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers:{
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model:"gpt-4",
        messages
      })
    });

    const data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({error:"Erro no servidor"});
  }
});

app.listen(3000, () => console.log("Backend rodando na porta 3000"));
