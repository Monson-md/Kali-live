import React, { useState, useEffect } from "react";
// Importation fictive des composants que nous avons déjà corrigés et stylisés.
// En réalité, dans un vrai projet React multifichiers, ces composants seraient importés
// depuis leurs fichiers respectifs (e.g., import CTFManager from "./components/CTFManager.jsx";)

// --- DEBUT DES COMPOSANTS EXTERNES INCLUS POUR LA CONTRAINTE MONO-FICHIER ---

// --- 1. CTFManager.jsx (inclus) ---
const API_BASE_URL_CTF = "http://localhost:8000/ctf"; 

function CTFManager() {
    // State pour la création de défi
    const [list, setList] = useState([]);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("web");
    const [description, setDescription] = useState("");
    const [flag, setFlag] = useState("");
    const [points, setPoints] = useState(100);
    const [creationMsg, setCreationMsg] = useState("");

    // State pour la soumission de flag (Modale)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentChallengeId, setCurrentChallengeId] = useState(null);
    const [submissionFlag, setSubmissionFlag] = useState("");
    const [submissionResult, setSubmissionResult] = useState(null); 

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            const res = await fetch(`${API_BASE_URL_CTF}/list`);
            if (!res.ok) throw new Error("Erreur lors de la récupération de la liste");
            const data = await res.json();
            setList(data);
        } catch (error) {
            console.error("Fetch Error:", error);
            setCreationMsg("Erreur de connexion à l'API.");
        }
    };

    const createChallenge = async () => {
        try {
            const res = await fetch(`${API_BASE_URL_CTF}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, description, flag, points: parseInt(points, 10) })
            });
            if (!res.ok) throw new Error("Erreur de création du défi.");
            const j = await res.json();
            setCreationMsg(`Défi créé: ${j.title} (ID: ${j.id})`);
            // Réinitialiser les champs
            setTitle('');
            setDescription('');
            setFlag('');
            setPoints(100);
            fetchList();
        } catch (error) {
            console.error("Create Error:", error);
            setCreationMsg("Erreur lors de la création du défi.");
        }
    };

    const openSubmissionModal = (id) => {
        setCurrentChallengeId(id);
        setSubmissionFlag("");
        setSubmissionResult(null);
        setIsModalOpen(true);
    };

    const checkFlag = async () => {
        if (!currentChallengeId || !submissionFlag) return;
        
        try {
            const res = await fetch(`${API_BASE_URL_CTF}/check-flag`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: currentChallengeId, flag: submissionFlag, user: "local-user" })
            });

            if (res.status === 404) {
                setSubmissionResult({ result: "error", message: "Défi non trouvé." });
                return;
            }

            const j = await res.json();
            setSubmissionResult(j);

        } catch (error) {
            console.error("Check Flag Error:", error);
            setSubmissionResult({ result: "error", message: "Erreur de communication API." });
        }
    };

    const SubmissionModal = () => {
        if (!isModalOpen) return null;

        const currentCh = list.find(ch => ch.id === currentChallengeId) || { title: 'Défis inconnu' };

        let resultMessage = null;
        if (submissionResult) {
            if (submissionResult.result === 'correct') {
                resultMessage = (
                    <div className="text-green-600 font-semibold mt-2">
                        Correct ! Vous gagnez {submissionResult.points} points.
                    </div>
                );
            } else if (submissionResult.result === 'incorrect') {
                resultMessage = (
                    <div className="text-red-600 font-semibold mt-2">
                        Drapeau incorrect. Réessayez.
                    </div>
                );
            } else if (submissionResult.result === 'error') {
                 resultMessage = (
                    <div className="text-yellow-600 font-semibold mt-2">
                        Erreur: {submissionResult.message}
                    </div>
                );
            }
        }

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                    <h4 className="text-xl font-bold mb-4 text-gray-800">Soumettre le drapeau pour : {currentCh.title}</h4>
                    
                    <input
                        type="text"
                        placeholder="Entrez le drapeau (flag)"
                        value={submissionFlag}
                        onChange={(e) => setSubmissionFlag(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-blue-500 focus:border-blue-500"
                        disabled={submissionResult && submissionResult.result !== 'incorrect' && submissionResult.result !== 'error'}
                    />
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                        >
                            Fermer
                        </button>
                        <button
                            onClick={checkFlag}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
                            disabled={!submissionFlag || (submissionResult && submissionResult.result !== 'incorrect' && submissionResult.result !== 'error')}
                        >
                            Vérifier
                        </button>
                    </div>
                    {resultMessage}
                </div>
            </div>
        );
    };


    return (
        <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-900 border-b pb-2">CTF Lab Manager</h1>

            {/* Section Création de Défi */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Créer un nouveau défi</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <input 
                        placeholder="Titre du défi" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        className="col-span-1 md:col-span-2 p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                     <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                    >
                        <option value="web">web</option>
                        <option value="crypto">crypto</option>
                        <option value="forensics">forensics</option>
                        <option value="pwn">pwn</option>
                    </select>
                    <input 
                        placeholder="Flag (solution)" 
                        value={flag} 
                        onChange={e => setFlag(e.target.value)} 
                        className="p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input 
                        type="number"
                        placeholder="Points" 
                        value={points} 
                        onChange={e => setPoints(e.target.value)} 
                        className="p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <textarea 
                        placeholder="Description détaillée du défi" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                        className="col-span-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                    />
                </div>
                <div className="flex justify-between items-center mt-4">
                    <button 
                        onClick={createChallenge}
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                        disabled={!title || !flag || !description}
                    >
                        Créer le Défi
                    </button>
                    <div className={`text-sm ${creationMsg.startsWith('Erreur') ? 'text-red-500' : 'text-green-600'}`}>
                        {creationMsg}
                    </div>
                </div>
            </div>

            {/* Section Liste des Défis */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Défis Existants ({list.length})</h3>
                {list.length === 0 ? (
                    <p className="text-gray-500 italic">Aucun défi créé pour le moment.</p>
                ) : (
                    <ul className="space-y-3">
                        {list.map(ch => (
                            <li key={ch.id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                                <div>
                                    <strong className="text-gray-800">{ch.title}</strong> 
                                    <span className="ml-2 text-sm text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">{ch.category}</span>
                                    <span className="ml-4 text-sm text-gray-600">{ch.points} pts</span>
                                    <p className="text-xs text-gray-500 mt-1">{ch.description.substring(0, 100)}...</p>
                                </div>
                                <button 
                                    onClick={() => openSubmissionModal(ch.id)}
                                    className="px-4 py-2 bg-teal-500 text-white rounded-lg shadow-sm hover:bg-teal-600 transition duration-150 text-sm"
                                >
                                    Soumettre Flag
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modale de Soumission */}
            <SubmissionModal />
        </div>
    );
}

// --- 2. LabDeploy.jsx (inclus) ---
const API_BASE_URL_LABS = "http://localhost:8000/labs";

function LabDeploy() {
  const [status, setStatus] = useState(null);
  const [labName, setLabName] = useState("vulnerable-web");
  const [isLoading, setIsLoading] = useState(false);

  async function deploy() {
    setIsLoading(true);
    setStatus({ message: "Déploiement du lab en cours...", type: "info" });
    
    try {
      const res = await fetch(`${API_BASE_URL_LABS}/deploy-simulated-lab?lab_name=${labName}`, { method: "POST" });
      
      const json = await res.json();

      if (json.status === "deployed") {
          setStatus({ message: `Lab ${json.lab} déployé avec succès.`, type: "success" });
      } else if (json.error || json.status === "error") {
          setStatus({ message: `Erreur de déploiement: ${json.detail || json.error}`, type: "error" });
      } else {
          setStatus({ message: JSON.stringify(json), type: "info" });
      }

    } catch (e) {
      console.error("Fetch Error:", e);
      setStatus({ message: `Erreur de connexion au serveur API.`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  const statusClasses = status ? {
    info: "bg-blue-100 text-blue-800 border-blue-300",
    success: "bg-green-100 text-green-800 border-green-300",
    error: "bg-red-100 text-red-800 border-red-300"
  }[status.type] : "";


  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-lg my-8">
      <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
        Déploiement de Laboratoire Docker
      </h3>
      
      <p className="text-sm text-gray-500 mb-6 italic">
        Usage réservé au labo local. L'outil `docker-compose` doit être installé et accessible par le backend pour que cette fonction réussisse.
      </p>

      <div className="flex flex-col space-y-4">
        <label className="text-gray-700 font-medium">Nom du Lab à déployer :</label>
        <select 
            value={labName}
            onChange={(e) => setLabName(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            disabled={isLoading}
        >
            <option value="vulnerable-web">vulnerable-web (Défaut)</option>
            <option value="crypto-lab">crypto-lab (Exemple)</option>
            {/* Ajoutez ici d'autres options de lab */}
        </select>
        
        <button 
          onClick={deploy}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-semibold shadow-md transition duration-150 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isLoading ? 'Déploiement en cours...' : 'Déployer Lab Local'}
        </button>
      </div>

      {status && (
        <div className={`mt-6 p-4 rounded-lg border-l-4 ${statusClasses}`}>
          <p className="font-mono text-sm whitespace-pre-wrap">
            {status.message}
          </p>
        </div>
      )}
    </div>
  );
}

// --- 3. PasswordTool.jsx (inclus) ---
const API_BASE_URL_MODULES = "http://localhost:8000/modules";

function PasswordTool() {
    const [len, setLen] = useState(16);
    const [pwd, setPwd] = useState("");
    const [msg, setMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function generatePassword() {
        if (len < 8 || len > 128) {
            setMsg("La longueur doit être comprise entre 8 et 128.");
            return;
        }

        setIsLoading(true);
        setMsg("Génération en cours...");
        setPwd("");

        try {
            const res = await fetch(`${API_BASE_URL_MODULES}/generate-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ length: Number(len) })
            });

            if (!res.ok) throw new Error("Erreur serveur lors de la génération.");

            const data = await res.json();
            setPwd(data.password);
            setMsg("Mot de passe généré avec succès.");

        } catch (error) {
            console.error("Fetch Error:", error);
            setMsg("Erreur de connexion à l'API ou échec de la requête.");
        } finally {
            setIsLoading(false);
        }
    }

    const copyToClipboard = () => {
        if (pwd) {
            const el = document.createElement('textarea');
            el.value = pwd;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setMsg("Mot de passe copié dans le presse-papiers !");
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-2xl my-8">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                Générateur de Mot de Passe Sécurisé
            </h3>
            
            <div className="flex flex-col space-y-4">
                <label htmlFor="length" className="text-gray-700 font-medium">
                    Longueur du mot de passe ({len} caractères) :
                </label>
                
                <input 
                    id="length"
                    type="range"
                    min={8} 
                    max={128}
                    value={len} 
                    onChange={e => setLen(e.target.value)} 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button 
                    onClick={generatePassword}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-lg font-semibold shadow-md transition duration-150 ${
                        isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                    {isLoading ? 'Génération...' : 'Générer le Mot de Passe'}
                </button>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Résultat :</h4>
                
                <div className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg border border-gray-300">
                    <code className="flex-grow text-lg break-all font-mono text-gray-800 select-all">
                        {pwd || 'Cliquez sur Générer...'}
                    </code>
                    
                    <button 
                        onClick={copyToClipboard}
                        disabled={!pwd}
                        className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition disabled:bg-gray-300"
                        title="Copier le mot de passe"
                    >
                        {/* Icône de presse-papiers Lucide */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                </div>
                
                <p className={`mt-3 text-sm font-medium ${msg.includes('Erreur') ? 'text-red-500' : 'text-green-600'}`}>
                    {msg}
                </p>
            </div>
        </div>
    );
}
// --- FIN DES COMPOSANTS EXTERNES INCLUS ---

// --- DEBUT DES COMPOSANTS ORIGINAUX MIS A JOUR ---

function Icon({ name }) {
    // Icons Lucide adaptés pour les outils
    const map = {
      dashboard: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" /></svg>
      ),
      labs: ( // LabDeploy Icon (Container)
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l5-10 5 10"/><path d="M12 2v20"/><path d="M2 17h20"/></svg>
      ),
      ctf: ( // CTF Icon (Target)
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
      ),
      password: ( // PasswordTool Icon (Key)
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4l-8 8 8 8M15 4h6v6M15 4l-8 8 8 8"/></svg>
      ),
      // Autres icons originaux (laissés pour la démo)
      wifi: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 8.5a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8 16.5a5 5 0 016 0M12 20.5l.01-.011"/></svg>
      ),
      bluetooth: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 7l10 10-5 5V2l5 5L7 17"/></svg>
      ),
      nmap: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      ),
      files: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
      ),
      terminal: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 17l6-6-6-6M12 19h8"/></svg>
      ),
      settings: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 15.5A3.5 3.5 0 1012 8.5a3.5 3.5 0 000 7z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06A2 2 0 017.1 2.1l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001 1.51V6a2 2 0 004 0V5.91a1.65 1.65 0 001-1.51h.01a1.65 1.65 0 001.82-.33l.06-.06A2 2 0 0120.9 6.9l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001 1.51H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
      )
    };
    return map[name] || null;
}

function Sidebar({ active, setActive }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', category: 'General' },
    
    // NOUVELLE CATÉGORIE POUR LES OUTILS API
    { id: 'heading-tools', label: 'Outils (API)', type: 'heading' },
    { id: 'ctf', label: 'CTF Manager', icon: 'ctf', category: 'API' },
    { id: 'labs', label: 'Lab Deployer', icon: 'labs', category: 'API' },
    { id: 'password', label: 'Password Generator', icon: 'password', category: 'API' },

    // Sections simulées existantes
    { id: 'heading-sim', label: 'Simulation', type: 'heading' },
    { id: 'wifi', label: 'Wi‑Fi', icon: 'wifi', category: 'Simulation' },
    { id: 'bluetooth', label: 'Bluetooth', icon: 'bluetooth', category: 'Simulation' },
    { id: 'nmap', label: 'Network Scan', icon: 'nmap', category: 'Simulation' },
    
    // Autres sections existantes
    { id: 'heading-sys', label: 'Système', type: 'heading' },
    { id: 'files', label: 'Files', icon: 'files', category: 'System' },
    { id: 'terminal', label: 'Terminal', icon: 'terminal', category: 'System' },
    { id: 'settings', label: 'Settings', icon: 'settings', category: 'System' }
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 min-h-screen p-4 hidden md:block">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-green-500 flex items-center justify-center font-bold">KL</div>
        <div>
          <div className="text-lg font-semibold">Haker Lite</div>
          <div className="text-xs text-gray-400">Édition éducative</div>
        </div>
      </div>

      <nav className="space-y-4">
        {items.map(it => {
            if (it.type === 'heading') {
                return <h4 key={it.id} className="text-xs font-bold uppercase text-gray-500 pt-3">{it.label}</h4>;
            }
            return (
                <button
                    key={it.id}
                    onClick={() => setActive(it.id)}
                    className={`w-full text-left flex items-center gap-3 py-2 px-3 rounded transition duration-150 ${active === it.id ? 'bg-gray-800 border-l-4 border-green-500' : 'hover:bg-gray-800/50'}`}>
                    <span className={`text-green-400 ${it.category === 'API' ? 'text-indigo-400' : ''}`}><Icon name={it.icon} /></span>
                    <span className="flex-1">{it.label}</span>
                    {it.category === 'API' && <span className="text-xs px-2 py-0.5 rounded bg-indigo-900 text-indigo-300">API</span>}
                    {it.category === 'Simulation' && <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">Simulé</span>}
                </button>
            );
        })}
      </nav>

      <div className="mt-8 text-xs text-gray-400">
        <div>Version 0.2</div>
        <div className="mt-2">Mode: <span className="text-green-300">Éducatif</span></div>
      </div>
    </aside>
  );
}

function Header({ activeView, onToggleSidebar }) {
  const titles = {
    dashboard: 'Dashboard',
    ctf: 'CTF Challenge Manager',
    labs: 'Lab Deployment Tool',
    password: 'Password Generator',
    wifi: 'Wi‑Fi Scanner (Simulé)',
    bluetooth: 'Bluetooth Scanner (Simulé)',
    nmap: 'Network Scanner (Simulé)',
    files: 'File Explorer (Maquette)',
    terminal: 'Terminal (Simulé)',
    settings: 'Settings'
  };
  
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-gray-100 md:ml-64 shadow-lg sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded bg-gray-700" onClick={onToggleSidebar}>☰</button>
        <h1 className="text-xl font-semibold text-green-400">{titles[activeView]}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-300 hidden sm:block">Mr Monson</div>
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold">M</div>
      </div>
    </header>
  );
}

// Composants Placeholder (inchangés ou simplifiés)

function Placeholder({ title, children }) {
  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-xl border border-gray-700">
      <h2 className="text-lg font-semibold mb-3 text-green-400">{title}</h2>
      {children}
    </div>
  );
}

function DashboardView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Placeholder title="Statut du Backend API">
        <div className="space-y-2 text-gray-300">
          <div>Services actifs: <strong className="text-green-400">3</strong></div>
          <div>Dernier Lab déployé: <strong>vulnerable-web</strong></div>
          <div>Défis CTF créés: <strong>0</strong> (Utiliser CTF Manager)</div>
        </div>
      </Placeholder>

      <Placeholder title="Modules Outils">
        <div className="flex flex-col gap-3">
          <button className="py-2 px-3 bg-indigo-600 rounded text-white font-semibold hover:bg-indigo-700" onClick={() => window.setActive('labs')}>
            Déployer Lab (Docker)
          </button>
          <button className="py-2 px-3 bg-teal-600 rounded text-white font-semibold hover:bg-teal-700" onClick={() => window.setActive('password')}>
            Générateur de Mots de Passe
          </button>
        </div>
      </Placeholder>

      <Placeholder title="Terminal & Fichiers">
        <div className="space-y-2 text-gray-300">
          <div>Accès Shell simulé: <strong>Disponible</strong></div>
          <div>Explorateur de fichiers: <strong>Disponible</strong></div>
        </div>
      </Placeholder>
    </div>
  );
}

function WifiView() {
  const [networks, setNetworks] = useState([]);
  // ... (Logique de simulation conservée)
  useEffect(() => {
    // placeholder: fetch from /api/wifi when backend ready
    setTimeout(() => {
      setNetworks([
        { ssid: 'HomeNet', signal: '-40 dBm', sec: 'WPA2' },
        { ssid: 'FreeWifi', signal: '-80 dBm', sec: 'Open' },
        { ssid: 'Office', signal: '-60 dBm', sec: 'WPA3' }
      ]);
    }, 400);
  }, []);

  return (
    <div className="space-y-6">
      <Placeholder title="Réseaux Wi‑Fi Détectés (Simulation)">
        <ul className="space-y-3 text-gray-300">
          {networks.map(n => (
            <li key={n.ssid} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition">
              <div>
                <div className="font-semibold text-white">{n.ssid}</div>
                <div className="text-xs text-gray-400">{n.sec} • {n.signal}</div>
              </div>
              <div>
                <button className="px-3 py-1 bg-green-500 text-black rounded-lg text-sm hover:bg-green-600">Détails</button>
              </div>
            </li>
          ))}
        </ul>
      </Placeholder>

      <Placeholder title="Conseils de Sécurité Sans Fil">
        <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-300">
          <li>Utilisez WPA2 ou WPA3 (si supporté) pour chiffrer votre trafic.</li>
          <li>Changez le mot de passe par défaut de votre routeur.</li>
          <li>Activez l'isolation client si vous proposez un Wi-Fi invité.</li>
        </ol>
      </Placeholder>
    </div>
  );
}

function BluetoothView(){
  const [devices, setDevices] = useState([]);
  useEffect(()=>{
    setTimeout(()=>{
      setDevices([{name:'Earbuds', rssi:'-40dBm'},{name:'Phone', rssi:'-55dBm'}]);
    },300);
  },[]);
  return (
    <div className="space-y-4">
      <Placeholder title="Appareils Bluetooth Proches (Simulation)">
        <ul className="space-y-3 text-gray-300">
          {devices.map(d=> (
            <li key={d.name} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition">
              <div>
                <div className="font-semibold text-white">{d.name}</div>
                <div className="text-xs text-gray-400">Signal: {d.rssi}</div>
              </div>
              <div><button className="px-3 py-1 bg-green-500 text-black rounded-lg text-sm hover:bg-green-600">Voir</button></div>
            </li>
          ))}
        </ul>
      </Placeholder>
    </div>
  );
}

function NMapView(){
  const [results, setResults] = useState(null);
  function runSim(){
    // placeholder simulate
    setResults({host:'192.168.1.10', open:[80,443], note:'Simulé - pas de scan réel'});
  }
  return (
    <div className="space-y-4">
      <Placeholder title="Simulateur de Scan Réseau (Nmap)">
        <div className="flex gap-3">
          <input className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-green-500 focus:border-green-500" placeholder="Cible (ex: 192.168.1.0/24)"/>
          <button onClick={runSim} className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg shadow-md hover:bg-green-600 transition">Lancer</button>
        </div>
        {results && (
          <div className="mt-4 bg-gray-700 p-4 rounded-lg text-gray-300">
            <h4 className="font-semibold text-white">Résultat du Scan :</h4>
            <div>Host: <strong className="text-yellow-400">{results.host}</strong></div>
            <div>Ports ouverts: <strong className="text-yellow-400">{results.open.join(', ')}</strong></div>
            <div className="text-xs text-gray-400 mt-2 italic">{results.note}</div>
          </div>
        )}
      </Placeholder>
    </div>
  );
}

function FilesView(){
  return (
    <div>
      <Placeholder title="Explorateur de Fichiers (Maquette)">
        <div className="text-sm text-gray-400 mb-4">Fonctionnalités: Importer / Exporter fichiers (images, docs) • Aperçu • Compression</div>
        <div className="mt-3">
          <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">Importer</button>
          <button className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 ml-3">Exporter</button>
        </div>
      </Placeholder>
    </div>
  );
}

function TerminalView(){
  const [lines, setLines] = useState(["$ Bienvenue dans le terminal d'apprentissage (Simulé)."]);
  const [cmd, setCmd] = useState('');

  function submit(){
    if(!cmd.trim()) return;
    setLines(l=>[...l, `$ ${cmd}`, `Réponse simulée: commande ${cmd.split(' ')[0]} non exécutée. (Mode éducatif)`]);
    setCmd('');
  }

  return (
    <div>
      <Placeholder title="Terminal Simulé (Éducatif)">
        <div className="bg-black text-green-300 p-4 rounded-lg h-64 overflow-auto font-mono text-sm border border-green-500/50">
          {lines.map((l,i)=> <div key={i}>{l}</div>)}
        </div>
        <div className="mt-3 flex gap-2">
          <input 
            value={cmd} 
            onChange={e=>setCmd(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && submit()}
            className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-green-500 focus:border-green-500" 
            placeholder="Entrez une commande (ex: ls, pwd)" 
          />
          <button onClick={submit} className="px-3 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 transition">Exécuter</button>
        </div>
      </Placeholder>
    </div>
  );
}

function SettingsView(){
  return (
    <div>
      <Placeholder title="Paramètres Généraux">
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span>Mode éducatif:</span> 
            <strong className="text-green-400">Activé</strong>
          </div>
          <div className="flex items-center justify-between">
            <span>Enregistrer les logs d'activité:</span> 
            <strong className="text-green-400">Oui</strong>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span>Réinitialiser le Lab Local (Docker):</span> 
            <button className="ml-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Reset Conteneurs</button>
          </div>
        </div>
      </Placeholder>
    </div>
  );
}

// Composant principal qui gère la navigation et le rendu

export default function App() {
  const [active, setActive] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(false);

  // Rendre la fonction setActive accessible globalement pour les boutons du Dashboard
  useEffect(() => {
    window.setActive = setActive;
    return () => delete window.setActive;
  }, []);


  const renderView = () => {
    switch(active) {
      case 'dashboard':
        return <DashboardView />;
      case 'ctf':
        return <CTFManager />;
      case 'labs':
        return <LabDeploy />;
      case 'password':
        return <PasswordTool />;
      case 'wifi':
        return <WifiView />;
      case 'bluetooth':
        return <BluetoothView />;
      case 'nmap':
        return <NMapView />;
      case 'files':
        return <FilesView />;
      case 'terminal':
        return <TerminalView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="flex">
        {/* Sidebar pour Desktop */}
        <Sidebar active={active} setActive={setActive} />
        
        {/* Sidebar pour Mobile (Modale) */}
        {showSidebar && (
            <div className="fixed inset-0 z-40 bg-gray-900 md:hidden">
                <Sidebar active={active} setActive={(id) => { setActive(id); setShowSidebar(false); }} />
                <button 
                    onClick={() => setShowSidebar(false)} 
                    className="absolute top-4 right-4 text-white p-2 rounded-full bg-gray-800"
                >
                    &times;
                </button>
            </div>
        )}

        <div className="flex-1">
          <Header activeView={active} onToggleSidebar={()=> setShowSidebar(s=>!s)} />

          <main className="p-4 sm:p-6 pb-20 md:ml-0">
            {renderView()}
            
            <footer className="mt-12 p-4 text-xs text-center text-gray-500 border-t border-gray-700">
                Haker Lite — Module éducatif • Ne pas utiliser pour attaquer des tiers
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}