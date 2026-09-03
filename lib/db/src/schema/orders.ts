import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export type OrderItemRow = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("order_code").notNull().unique(),
  tableNumber: text("table_number").notNull(),
  items: jsonb("items").$type<OrderItemRow[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  total: integer("total").notNull(),
  paymentMethod: text("payment_method").notNull(),
  cashReceived: integer("cash_received"),
  status: text("status").notNull().default("baru"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = typeof ordersTable.$inferInsert;
