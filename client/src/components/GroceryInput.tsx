import { useState } from 'react'
import axios from 'axios'
import {
  ShoppingCart,
  Brain,
  ChevronRight,
  Leaf,
  CircleDollarSign,
} from 'lucide-react'
import ItemInput from './ItemInput'
import ShoppingList from './ShoppingList'

export type GroceryItem = {
  name: string
  quantity: number
  preferences: {
    brand?: string
    organic?: boolean
    country?: string
    lowestPrice?: boolean
  }
}

type Result = {
  item: GroceryItem
  status: 'added' | 'skipped' | 'not_added' | 'error'
  reason?: string
  productName?: string
  href?: string
  price?: string
  suggestions?: string[]
}

export const GroceryInput = () => {
  const [automationConsent, setAutomationConsent] = useState(false)
  const [items, setItems] = useState<GroceryItem[]>([])
  const [tempItem, setTempItem] = useState({
    name: '',
    quantity: 1,
    brand: '',
    country: '',
    organic: false,
    lowestPrice: false,
  })
  const [isfetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Result[]>([])

  const handleUpdateItem = (
    field: keyof typeof tempItem,
    value: string | number | boolean
  ) => {
    setTempItem((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addItem = () => {
    if (!tempItem.name || tempItem.quantity < 1) return

    const newItem: GroceryItem = {
      name: tempItem.name,
      quantity: tempItem.quantity,
      preferences: {
        organic: tempItem.organic,
        brand: tempItem.brand || undefined,
        country: tempItem.country || undefined,
        lowestPrice: tempItem.lowestPrice,
      },
    }

    setItems([...items, newItem])

    // Reset form
    setTempItem({
      name: '',
      quantity: 1,
      brand: '',
      country: '',
      organic: false,
      lowestPrice: false,
    })
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleToggleAutomationConsent = () => {
    setAutomationConsent((prev) => !prev)
  }

  const submitItems = async () => {
    if (items.length === 0) return
    try {
      setIsFetching(true)
      setResult([])
      const res = await axios.post(
        'http://localhost:4000/api/submit-groceries',
        {
          items,
        }
      )
      setResult(res.data.result)
    } catch (error) {
      setError(
        'An error occurred while processing your request. Please try again.'
      )
      console.error('Error submitting items:', error)
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            <ShoppingCart className="inline-block mr-2 mb-1" size={32} />
            Smart Grocery Assistant
          </h1>
          <p className="text-gray-600">
            Let AI help you shop smarter at Whole Foods
          </p>
        </header>
        <div className="flex flex-col md:flex-row md:justify-center md:gap-10">
          <div className="flex-1">
            <ItemInput
              addItem={addItem}
              handleUpdateItem={handleUpdateItem}
              tempItem={tempItem}
            />

            <div className={`bg-white rounded-xl shadow-lg p-6 mb-8`}>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-2" />
                Shopping List
              </h2>

              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Your shopping list is empty
                </p>
              ) : (
                <ShoppingList
                  items={items}
                  removeItem={removeItem}
                  handleToggleAutomationConsent={handleToggleAutomationConsent}
                  automationConsent={automationConsent}
                  submitItems={submitItems}
                  isFetching={isfetching}
                  error={error}
                />
              )}
            </div>
          </div>

          {result.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  )
}
