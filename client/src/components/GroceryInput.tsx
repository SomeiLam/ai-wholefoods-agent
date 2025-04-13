import { useState } from 'react'
import axios from 'axios'
import { ShoppingCart } from 'lucide-react'
import ItemInput from './ItemInput'
import ShoppingList from './ShoppingList'
import AIResult from './AIResult'
import { GroceryItem, Result } from '../types'

const apiUrl = import.meta.env.API_URL
// const apiUrl = 'http://localhost:4000'

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
    setError(null)
    if (items.length === 0) return
    try {
      setIsFetching(true)
      setResult([])
      const res = await axios.post(`${apiUrl}/api/submit-groceries`, {
        items,
      })
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
          <div className="flex-1 max-w-2xl">
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

          {result.length > 0 && <AIResult result={result} />}
        </div>
      </div>
    </div>
  )
}
