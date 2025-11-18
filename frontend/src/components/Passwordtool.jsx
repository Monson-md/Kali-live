import React, { useState } from 'react';

// Définition de l'URL de base de l'API (à adapter si votre backend n'est pas sur le port 8000)
// Nous utilisons le préfixe /modules que vous avez défini dans main.py
const API_BASE_URL = "http://localhost:8000/modules";

export default function PasswordTool() {
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
            // Utilisation de l'URL complète
            const res = await fetch(`${API_BASE_URL}/generate-password`, {
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
            // Utilisation de document.execCommand pour une meilleure compatibilité dans les sandboxes
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