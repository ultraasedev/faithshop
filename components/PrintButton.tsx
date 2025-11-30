'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-black text-white px-6 py-3 font-medium uppercase tracking-wider text-sm hover:bg-gray-800"
    >
      Imprimer / Télécharger PDF
    </button>
  )
}
