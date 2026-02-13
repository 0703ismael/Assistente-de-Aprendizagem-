(() => {
  // Config backend (modifique aqui para seu backend real)
  const BACKEND_URL = "http://localhost:3000/chat";

  // DOM
  const messagesEl = document.getElementById("messages");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const avatar3dEl = document.getElementById("avatar3d");
  const btnFemale = document.getElementById("btnFemale");
  const btnMale = document.getElementById("btnMale");

  let scene, camera, renderer, avatarModel, mixer, clock;

  // Inicializa Three.js e carrega modelo
  function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, avatar3dEl.clientWidth / avatar3dEl.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.7, 3);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(avatar3dEl.clientWidth, avatar3dEl.clientHeight);
    avatar3dEl.innerHTML = "";
    avatar3dEl.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 20, 0);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(3, 10, 10);
    scene.add(dirLight);

    clock = new THREE.Clock();

    animate();
  }

  // Carregar avatar GLTF simples
  function loadAvatar(url) {
    if (avatarModel) {
      scene.remove(avatarModel);
      avatarModel.traverse(child => {
        if (child.isMesh) child.geometry.dispose();
      });
      avatarModel = null;
    }
    const loader = new THREE.GLTFLoader();
    loader.load(url, (gltf) => {
      avatarModel = gltf.scene;
      avatarModel.position.set(0, 0, 0);
      avatarModel.rotation.y = Math.PI;
      scene.add(avatarModel);

      if (gltf.animations.length) {
        mixer = new THREE.AnimationMixer(avatarModel);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }
    }, undefined, error => console.error(error));
  }

  // Loop animação
  function animate() {
    requestAnimationFrame(animate);
    if (mixer) {
      const delta = clock.getDelta();
      mixer.update(delta);
    }
    renderer.render(scene, camera);
  }

  // Detecta idioma simples para TTS
  function detectLang(text) {
    text = text.toLowerCase();
    if (text.match(/[àáâãçéèêíóôõúü]/)) {
      if (text.match(/[éèê]/)) return "fr-FR";
      if (text.match(/[áàãç]/)) return "es-ES";
      return "pt-BR";
    }
    return "en-US";
  }

  // TTS
  function speak(text) {
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = detectLang(text);
      utter.rate = 1;
      utter.pitch = 1;
      speechSynthesis.speak(utter);
    }
  }

  // Adicionar mensagem no chat
  function addMessage(text, fromUser = false) {
    const div = document.createElement("div");
    div.className = "message " + (fromUser ? "userMessage" : "botMessage");
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Enviar mensagem para backend IA
  async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    addMessage(text, true);
    userInput.value = "";
    addMessage("... pensando ...");
    try {
      const systemPrompt = `Você é uma professora de idiomas extremamente didática, divertida e clara.
Idiomas: Inglês, Francês, Espanhol.
Deve corrigir erros, ensinar vocabulário, gramática e sugerir exercícios.`;

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ]
        })
      });
      const data = await res.json();
      messagesEl.lastChild.textContent = data.choices[0].message.content;
      speak(data.choices[0].message.content);
    } catch (e) {
      messagesEl.lastChild.textContent = "Erro ao conectar IA.";
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

  // Trocar avatar
  btnFemale.onclick = () => {
    loadAvatar("https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb");
  };
  btnMale.onclick = () => {
    loadAvatar("https://threejs.org/examples/models/gltf/Flamingo.glb"); // Exemplo, troque para avatar humano real
  };

  init3D();
})();
