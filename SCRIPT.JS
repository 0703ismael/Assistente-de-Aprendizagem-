const chatContainer = document.getElementById("chatContainer");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const avatarChoice = document.getElementById("avatarChoice");
let selectedAvatar = null;

// Sua chave OpenAI aqui
const OPENAI_API_KEY = "SUA_API_KEY"; 

// Escolher avatar
function chooseAvatar(avatar){
    selectedAvatar = avatar;
    avatarChoice.classList.add("hidden");
    document.getElementById("chatContainer").classList.remove("hidden");
    document.getElementById("inputArea").classList.remove("hidden");
    addMessage(`Olá! Eu sou sua professora de idiomas. Vamos aprender inglês, francês e espanhol!`, "bot");
}

// Adicionar mensagem no chat com avatar
function addMessage(text, sender){
    const div = document.createElement("div");
    div.className = "message " + sender;
    
    if(sender==="bot"){
        const img = document.createElement("img");
        img.className = "avatar-img";
        img.src = selectedAvatar==="female"?"female_avatar.png":"male_avatar.png";
        div.appendChild(img);
    }
    
    const span = document.createElement("span");
    span.textContent = text;
    div.appendChild(span);
    
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Detecta intenção
function detectIntent(text){
    text = text.toLowerCase();
    if(text.includes("traduzir") || text.includes("translate")) return "translation";
    if(text.includes("como se diz") || text.includes("how do you say")) return "translation";
    if(text.includes("explique") || text.includes("explain")) return "explanation";
    if(text.includes("exercício") || text.includes("exercise")) return "exercise";
    return "general";
}

// Fala a resposta
function speak(text, lang='pt-BR'){
    if('speechSynthesis' in window){
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang;
        utter.rate = 1;
        utter.pitch = 1;
        speechSynthesis.speak(utter);
    }
}

// Chamada GPT
async function getGPTResponse(userText){
    const intent = detectIntent(userText);
    const systemPrompt = `
Você é uma professora de idiomas extremamente didática, divertida e clara.
Idiomas: Inglês, Francês, Espanhol.
Deve corrigir erros, ensinar vocabulário, gramática e sugerir exercícios.
Responda de forma independente, criativa e educativa.
Intenção detectada: ${intent}.
`;
    const body = {
        model: "gpt-4",
        messages:[
            {role:"system", content: systemPrompt},
            {role:"user", content:userText}
        ]
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    return data.choices[0].message.content.trim();
}

// Enviar mensagem
async function sendMessage(){
    const text = userInput.value.trim();
    if(!text) return;
    addMessage(text, "user");
    userInput.value="";

    addMessage("…", "bot"); // placeholder
    const botIndex = chatContainer.children.length-1;

    try{
        const response = await getGPTResponse(text);
        chatContainer.children[botIndex].lastChild.textContent = response;

        // Detecta idioma para voz
        let lang='pt-BR';
        if(response.match(/[a-zA-Z]/) && !response.match(/[áéíóúàè]/)) lang='en-US'; // inglês simples
        // você pode adicionar regex para francês e espanhol
        speak(response, lang);

    }catch(e){
        chatContainer.children[botIndex].lastChild.textContent = "Erro ao conectar IA.";
    }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", function(e){
    if(e.key==="Enter") sendMessage();
});
