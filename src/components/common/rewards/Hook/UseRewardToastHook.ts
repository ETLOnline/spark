"use client"

import * as React from "react"
import type { ToastProps } from "@/src/components/ui/toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 2000

type RewardToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  reward?: number
}

type Action =
  | { type: "ADD"; toast: RewardToast }
  | { type: "DISMISS"; id?: string }
  | { type: "REMOVE"; id?: string }

interface State {
  toasts: RewardToast[]
}

let memoryState: State = { toasts: [] }
const listeners: Array<(state: State) => void> = []

let count = 0
function genId() {
  count++
  return count.toString()
}

const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

function addToRemoveQueue(id: string) {
  if (timeouts.has(id)) return

  const timeout = setTimeout(() => {
    timeouts.delete(id)
    dispatch({ type: "REMOVE", id })
  }, TOAST_REMOVE_DELAY)

  timeouts.set(id, timeout)
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      }

    case "DISMISS":
      if (action.id) addToRemoveQueue(action.id)
      else state.toasts.forEach((t) => addToRemoveQueue(t.id))

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          !action.id || t.id === action.id ? { ...t, open: false } : t
        )
      }

    case "REMOVE":
      return {
        ...state,
        toasts: action.id ? state.toasts.filter((t) => t.id !== action.id) : []
      }
  }
}

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((l) => l(memoryState))
}

export function rewardToast(props: Omit<RewardToast, "id">) {
  const id = genId()

  dispatch({
    type: "ADD",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dispatch({ type: "DISMISS", id })
      }
    }
  })
}

export function useRewardToast() {
  const [state, setState] = React.useState(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const i = listeners.indexOf(setState)
      if (i > -1) listeners.splice(i, 1)
    }
  }, [])

  return state
}
