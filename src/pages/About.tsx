/**
 * Page À propos
 * Explique la démarche NIRD et les objectifs pédagogiques du projet
 */
import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="w-full min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-slate-700">
        <h1 className="text-2xl font-bold text-green-400">
          🌿 Village Numérique Résistant
        </h1>
        <nav className="space-x-4">
          <button
            onClick={() => navigate('/')}
            className="text-slate-300 hover:text-green-400 transition-colors"
          >
            Accueil
          </button>
          <button
            onClick={() => navigate('/game')}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors"
          >
            Jouer
          </button>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Section NIRD */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-green-400 mb-6">
            Qu'est-ce que la démarche NIRD ?
          </h2>
          <p className="text-slate-300 text-lg mb-6">
            NIRD signifie <strong className="text-white">Numérique Inclusif, Responsable, Durable et de Réemploi</strong>.
            C'est une approche qui vise à réduire l'impact environnemental et social du numérique.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold text-blue-400 mb-3">🌍 Inclusif</h3>
              <p className="text-slate-400">
                Rendre le numérique accessible à tous, en luttant contre la fracture numérique
                et en donnant accès à des équipements informatiques aux publics défavorisés.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold text-purple-400 mb-3">⚖️ Responsable</h3>
              <p className="text-slate-400">
                Adopter des pratiques éthiques dans l'utilisation du numérique :
                protection des données, sobriété numérique, logiciels libres.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold text-green-400 mb-3">♻️ Durable</h3>
              <p className="text-slate-400">
                Prolonger la durée de vie des équipements, réduire les déchets électroniques
                et minimiser l'empreinte carbone du numérique.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold text-orange-400 mb-3">🔄 Réemploi</h3>
              <p className="text-slate-400">
                Reconditionner les équipements obsolètes, leur donner une seconde vie
                avec des systèmes d'exploitation légers comme Linux.
              </p>
            </div>
          </div>
        </section>

        {/* Section Le Jeu */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-green-400 mb-6">
            Le concept du jeu
          </h2>
          <p className="text-slate-300 text-lg mb-4">
            Dans ce mini-jeu éducatif, vous incarnez un acteur du Village Numérique Résistant.
            Votre mission :
          </p>
          <ol className="list-decimal list-inside space-y-3 text-slate-300 text-lg ml-4">
            <li>
              <strong className="text-blue-400">Collecter</strong> des ordinateurs obsolètes
              dans les entreprises qui s'en débarrassent
            </li>
            <li>
              <strong className="text-orange-400">Reconditionner</strong> ces machines
              dans l'atelier NIRD en les passant sous Linux
            </li>
            <li>
              <strong className="text-green-400">Redistribuer</strong> les ordinateurs
              reconditionnés dans les établissements scolaires
            </li>
          </ol>
        </section>

        {/* Section Pourquoi Linux */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-green-400 mb-6">
            Pourquoi Linux ?
          </h2>
          <div className="bg-slate-800 p-6 rounded-lg border border-green-500/30">
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span><strong>Gratuit et libre</strong> : pas de coûts de licence</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span><strong>Léger</strong> : fonctionne sur du matériel ancien</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span><strong>Sécurisé</strong> : moins vulnérable aux virus</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span><strong>Éducatif</strong> : encourage la compréhension du système</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <span><strong>Communautaire</strong> : soutenu par une communauté mondiale</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section L'équipe */}
        <section>
          <h2 className="text-3xl font-bold text-green-400 mb-6">
            L'équipe
          </h2>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <p className="text-slate-300 text-lg mb-4">
              Projet réalisé lors de <strong className="text-white">La Nuit de l'Info 2024</strong>
              par l'équipe <strong className="text-green-400">Les Grosses Chaussures</strong>.
            </p>
            <p className="text-slate-400">
              4 développeurs passionnés, 14 heures de développement intensif,
              une mission : sensibiliser au numérique responsable et au réemploi.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-slate-500 border-t border-slate-700">
        <p>La Nuit de l'Info 2024 - Les Grosses Chaussures</p>
        <p className="mt-2">
          Fait avec 💚 pour un numérique plus responsable
        </p>
      </footer>
    </div>
  )
}
