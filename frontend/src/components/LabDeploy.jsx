import React, { useState } from 'react';

// Définition de l'URL de base de l'API (à adapter si votre backend n'est pas sur le port 8000)
// Nous utilisons le préfixe /labs que vous avez défini dans main.py
const API_BASE_URL = "http://localhost:8000/labs";

export default function LabDeploy() {
  const [status, setStatus] = useState(null);
  const [labName, setLabName] = useState("vulnerable-web");
  const [isLoading, setIsLoading] = useState(false);

  // Note: Le backend attend le lab_name comme paramètre de requête (query parameter)
  async function deploy() {
    setIsLoading(true);
    setStatus({ message: "Déploiement du lab en cours...", type: "info" });
    
    try {
      // Utilisation de l'URL complète
      const res = await fetch(`${API_BASE_URL}/deploy-simulated-lab?lab_name=${labName}`, { method: "POST" });
      
      const json = await res.json();

      if (json.status === "deployed") {
          setStatus({ message: `Lab ${json.lab} déployé avec succès.`, type: "success" });
      } else if (json.error || json.status === "error") {
          // Gérer les erreurs de l'API (ex: compose file missing)
          setStatus({ message: `Erreur de déploiement: ${json.detail || json.error}`, type: "error" });
      } else {
          // Afficher la réponse brute pour les cas inattendus
          setStatus({ message: JSON.stringify(json), type: "info" });
      }

    } catch (e) {
      console.error("Fetch Error:", e);
      setStatus({ message: `Erreur de connexion au serveur API.`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  // Styles Tailwind pour les messages
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