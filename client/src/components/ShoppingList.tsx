import {
  Brain,
  BrainCircuit,
  CircleDollarSign,
  Flag,
  Leaf,
  Store,
  X,
} from 'lucide-react'
import { GroceryItem } from '../types'

interface ShoppingListProps {
  items: GroceryItem[]
  removeItem: (index: number) => void
  handleToggleAutomationConsent: () => void
  automationConsent: boolean
  submitItems: () => void
  isFetching: boolean
  error: string | null
}

const ShoppingList: React.FC<ShoppingListProps> = ({
  items,
  removeItem,
  handleToggleAutomationConsent,
  automationConsent,
  submitItems,
  isFetching,
  error,
}) => {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex-1">
            <div className="font-medium text-gray-800">
              {item.name} × {item.quantity}
            </div>
            <div className="mt-1 text-sm text-gray-600 flex flex-row items-center flex-wrap">
              {item.preferences.organic && (
                <span className="inline-flex items-center mr-3">
                  <Leaf className="w-4 h-4 mr-1 text-green-500" />
                  Organic
                </span>
              )}
              {item.preferences.brand && (
                <span className="inline-flex items-center mr-3">
                  <Store className="w-4 h-4 mr-1 text-red-500" />
                  Brand: {item.preferences.brand}
                </span>
              )}
              {item.preferences.country && (
                <span className="inline-flex items-center mr-3">
                  <Flag className="w-4 h-4 mr-1 text-blue-500" />
                  Origin: {item.preferences.country}
                </span>
              )}
              {item.preferences.lowestPrice && (
                <span className="inline-flex items-center mr-3">
                  <CircleDollarSign className="w-4 h-4 mr-1 text-orange-500" />
                  Lowest price preferred
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => removeItem(i)}
            className={`ml-4 p-1 text-gray-400 ${isFetching ? '' : 'hover:text-red-500'} transition-colors duration-200`}
            disabled={isFetching}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}

      <div
        className="mt-4 space-y-2 border p-3 rounded bg-yellow-50 cursor-pointer transform transition-transform duration-300 ease-in-out hover:scale-105"
        onClick={isFetching ? () => {} : handleToggleAutomationConsent}
      >
        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={automationConsent}
            onChange={isFetching ? () => {} : handleToggleAutomationConsent}
            className="mt-1 rounded text-green-500 focus:ring-green-500 cursor-pointer"
            disabled={isFetching}
          />
          <span className="text-sm">
            I allow this app to run automation on my Amazon account to add
            groceries to my cart.
          </span>
        </label>
        <div className="text-xs text-gray-600 pl-6">
          ⚠️ This automation <strong>does not purchase</strong> anything. It
          only:
          <ul className="list-disc list-inside mt-1 pl-5">
            <li>Searches for your selected items</li>
            <li>Adds matching items to your Amazon cart</li>
            <li>Shows product suggestions based on your preferences</li>
          </ul>
        </div>
      </div>

      <div className="flex mt-6 flex-col space-y-4">
        {error && (
          <div className="text-red-500 text-sm">
            <span>
              Oops! Something went wrong. Please check your Amazon account and
              try again.
            </span>
          </div>
        )}
        <button
          onClick={submitItems}
          disabled={!automationConsent || isFetching}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? (
            <BrainCircuit className="w-5 h-5" />
          ) : (
            <Brain className="w-5 h-5" />
          )}
          <span>{isFetching ? 'Running Automation' : 'Start AI Shopping'}</span>
        </button>
      </div>
    </div>
  )
}

export default ShoppingList
