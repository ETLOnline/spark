"use client"

import { ArrowUpRight, ExternalLink } from "lucide-react"
import { Badge } from "../../../ui/badge"
import { Card } from "../../../ui/card"
import PaginationComponent from "@/src/components/common/Pagination"
import { formatActivityName } from "@/src/utils/clientHelper"
import { LinkAsButton } from "@/src/components/LinkAsButton/LinkAsButton"

interface TransactionProps {
  transection_id: number
  reward_id: number
  amount: number
  transection_type: string
  created_at: string
  trust_verification_id?: number | null
  metadata?: { proof_url?: string | null } | null
  rule?: {
    action_display_name: string
    category_group: string
    description: string
  }
}

interface TransactionLedgerProps {
  TransactionsData: TransactionProps[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TransactionLedger({
  TransactionsData,
  currentPage,
  totalPages,
  onPageChange
}: TransactionLedgerProps) {
  const data = Array.isArray(TransactionsData) ? TransactionsData : []

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">
        Transaction History
      </h3>

      <div className="space-y-3">
        {data.map((transaction) => (
          <TransactionRow
            key={transaction.transection_id}
            transaction={transaction}
          />
        ))}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No transactions found.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 pt-4 border-t">
          <PaginationComponent
            pagination={{ page: currentPage, totalPages, total: 0, limit: 10 }}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </Card>
  )
}

function TransactionRow({ transaction }: { transaction: TransactionProps }) {
  const proofUrl = transaction.metadata?.proof_url ?? null
  const isVerifiedTask = transaction.trust_verification_id != null && !!proofUrl
  return (
    <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="p-2 rounded-lg flex items-center justify-center w-10 h-10 border">
        <ArrowUpRight className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-foreground">
            {transaction.rule?.action_display_name ?? "Reward"}
          </h4>
          <Badge variant="outline" className="text-xs">
            {formatActivityName(transaction.rule?.category_group ?? "General")}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {transaction.rule?.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(transaction.created_at).toLocaleDateString()}
          {isVerifiedTask && (
            <LinkAsButton
              href={proofUrl!}
              target="_blank"
              rel="noopener noreferrer"
              variant="link"
              size="sm"
              className="h-auto px-2 mt-2"
            >
              View task
              <ExternalLink className="w-3 h-3" />
            </LinkAsButton>
          )}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        {transaction.reward_id === 1 && (
          <div className="flex items-center gap-1 text-sm font-medium text-primary">
            <ArrowUpRight className="w-4 h-4" />+{transaction.amount} RP
          </div>
        )}
        {transaction.reward_id === 2 && (
          <div className="flex items-center gap-1 text-sm font-medium text-purple-600">
            <ArrowUpRight className="w-4 h-4" />+{transaction.amount} SC
          </div>
        )}
      </div>
    </div>
  )
}
