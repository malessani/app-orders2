import { isMockedId, makeOrder } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'

export const orderIncludeAttribute = [
  'market',
  'customer',
  'line_items',
  'shipping_address',
  'billing_address',
  'shipments',
  'payment_method',
  'payment_source'
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOrderDetails(id: string) {
  const {
    data: order,
    isLoading,
    mutate: mutateOrder,
    isValidating
  } = useCoreApi(
    'orders',
    'retrieve',
    [
      id,
      {
        include: orderIncludeAttribute
      }
    ],
    {
      isPaused: () => isMockedId(id),
      fallbackData: makeOrder()
    }
  )

  return { order, isLoading, mutateOrder, isValidating }
}
