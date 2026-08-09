import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { initialDataset } from "./generate";
import type {
  Category,
  Dataset,
  Order,
  Payment,
  PaymentStatus,
  Product,
  Review,
  User,
} from "./types";

interface StoreValue extends Dataset {
  addUser: (user: Omit<User, "id" | "createdAt">) => User;
  updateUser: (id: number, patch: Partial<Omit<User, "id">>) => void;
  deleteUser: (id: number) => void;
  addProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (id: number, patch: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: number) => void;
  addCategory: (category: Omit<Category, "id">) => Category;
  updateCategory: (id: number, patch: Partial<Omit<Category, "id">>) => void;
  deleteCategory: (id: number) => void;
  addOrder: (order: Omit<Order, "id">, paymentStatus: PaymentStatus) => Order;
  updateOrderStatus: (id: number, status: Order["status"]) => void;
  deleteReview: (id: number) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const nextId = (rows: Array<{ id: number }>) =>
  rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset>(initialDataset);

  const addUser = useCallback((user: Omit<User, "id" | "createdAt">) => {
    const created: User = {
      ...user,
      id: nextId(data.users),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setData((prev) => ({ ...prev, users: [created, ...prev.users] }));
    return created;
  }, [data.users]);

  const updateUser = useCallback((id: number, patch: Partial<Omit<User, "id">>) => {
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
  }, []);

  const deleteUser = useCallback((id: number) => {
    setData((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
  }, []);

  const addProduct = useCallback((product: Omit<Product, "id">) => {
    const created: Product = { ...product, id: nextId(data.products) };
    setData((prev) => ({ ...prev, products: [created, ...prev.products] }));
    return created;
  }, [data.products]);

  const updateProduct = useCallback((id: number, patch: Partial<Omit<Product, "id">>) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const deleteProduct = useCallback((id: number) => {
    setData((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  }, []);

  const addCategory = useCallback((category: Omit<Category, "id">) => {
    const created: Category = { ...category, id: nextId(data.categories) };
    setData((prev) => ({ ...prev, categories: [created, ...prev.categories] }));
    return created;
  }, [data.categories]);

  const updateCategory = useCallback((id: number, patch: Partial<Omit<Category, "id">>) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCategory = useCallback((id: number) => {
    setData((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
  }, []);

  const addOrder = useCallback(
    (order: Omit<Order, "id">, paymentStatus: PaymentStatus) => {
      const created: Order = { ...order, id: nextId(data.orders) };
      const amount = created.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      const payment: Payment = {
        id: nextId(data.payments),
        orderId: created.id,
        amount: Number(amount.toFixed(2)),
        method: created.paymentMethod,
        status: paymentStatus,
        date: created.date,
      };
      setData((prev) => ({
        ...prev,
        orders: [created, ...prev.orders],
        payments: [payment, ...prev.payments],
      }));
      return created;
    },
    [data.orders, data.payments],
  );

  const updateOrderStatus = useCallback((id: number, status: Order["status"]) => {
    setData((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
  }, []);

  const deleteReview = useCallback((id: number) => {
    setData((prev) => ({ ...prev, reviews: prev.reviews.filter((r) => r.id !== id) }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...data,
      addUser,
      updateUser,
      deleteUser,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addOrder,
      updateOrderStatus,
      deleteReview,
    }),
    [
      data,
      addUser,
      updateUser,
      deleteUser,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      addOrder,
      updateOrderStatus,
      deleteReview,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside AdminStoreProvider");
  return ctx;
}

export type { Review, Order, Payment, Product, Category, User };
