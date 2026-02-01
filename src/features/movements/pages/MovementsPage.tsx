import { useState } from 'react';
import { MovementType } from '@models/index';
import type { Movement } from '@models/index';
import { Card } from '../../../components';
import MovementList from '../components/MovementList';

const MovementsPage = () => {
  const [movements] = useState<Movement[]>([
    {
      id: '1',
      productId: '1',
      type: MovementType.IN,
      quantity: 50,
      reason: 'Compra inicial',
      createdAt: new Date(),
      createdBy: 'admin@vostok.com',
    },
    {
      id: '2',
      productId: '1',
      type: MovementType.OUT,
      quantity: 10,
      reason: 'Venta',
      createdAt: new Date(),
      createdBy: 'admin@vostok.com',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Movimientos de Inventario</h1>
      </div>

      <Card>
        <MovementList movements={movements} />
      </Card>
    </div>
  );
};

export default MovementsPage;
