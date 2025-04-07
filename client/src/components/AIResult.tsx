import {
  Brain,
  ChevronRight,
  CircleDollarSign,
  Leaf,
  ShoppingCart,
} from 'lucide-react'
import { Result } from '../types'

interface AIResultProps {
  result: Result[]
}

const AIResult: React.FC<AIResultProps> = ({ result }) => {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <Brain className="w-6 h-6 mr-2" />
        AI Results
      </h2>

      <div className="space-y-4">
        {result.map((r, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-gray-50 border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {/* Show requested item details */}
                  <div className="flex flex-row items-center">
                    <span>
                      Requested: {r.item?.name} × {r.item?.quantity}
                    </span>
                    {r.status !== 'added' && (
                      <span
                        className={`inline-flex items-center ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'skipped'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    )}
                    {r.item?.preferences?.organic && (
                      <span className="inline-flex items-center ml-2">
                        <Leaf className="w-4 h-4 mr-1 text-green-500" />
                        Organic
                      </span>
                    )}
                    {r.item?.preferences?.lowestPrice && (
                      <span className="inline-flex items-center ml-2">
                        <CircleDollarSign className="w-4 h-4 mr-1 text-orange-500" />
                        Lowest Price
                      </span>
                    )}
                  </div>
                  <div className="mb-2 flex flex-row items-center">
                    {r.item?.preferences?.brand && (
                      <span className="font-medium">
                        Brand: {r.item?.preferences?.brand}
                      </span>
                    )}
                    {r.item?.preferences?.country && (
                      <span className="font-medium">
                        Origin: {r.item?.preferences?.country}
                      </span>
                    )}
                  </div>
                  {/* Show matched product details if available */}
                  {r.status === 'added' && r.productName && (
                    <div className="text-green-700">
                      Found: {r.productName} {r.price && `- ${r.price}`}
                      <span className="inline-flex items-center ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {r.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {r.href && (
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </a>
              )}
            </div>

            {r.reason && (
              <div className="mt-3 text-sm text-gray-600">
                <div className="font-medium mb-1">AI's Reasoning:</div>
                <p>{r.reason}</p>
              </div>
            )}

            {r.suggestions && r.suggestions.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                <div className="font-medium mb-1">Suggestions:</div>
                <ul className="list-disc list-inside space-y-1">
                  {r.suggestions.map((s: string) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() =>
            window.open(
              'https://www.amazon.com/gp/cart/view.html?ref_=nav_cart',
              '_blank'
            )
          }
          className="w-full border-2 border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Go to Shopping Cart</span>
        </button>
      </div>
    </div>
  )
}

export default AIResult
