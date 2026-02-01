import { useState } from 'react';
import type { Product } from '@models/index';
import { Button, Card } from '../../../components';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

const InventoryPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleAddProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts([...products, newProduct]);
    setShowForm(false);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Agregar Producto'}
        </Button>
      </div>

      {showForm && (
        <Card title="Nuevo Producto">
          <ProductForm onSubmit={handleAddProduct} onCancel={() => setShowForm(false)} />
        </Card>
      )}

      <Card>
        <ProductList products={products} onDelete={handleDeleteProduct} />
      </Card>
    </div>
  );
};

export default InventoryPage;
