import { MovementType } from '@models/index';
import type { Movement } from '@models/index';
import { formatDate } from '@utils/index';

interface MovementListProps {
  movements: Movement[];
}

const MovementList = ({ movements }: MovementListProps) => {
  if (movements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No hay movimientos registrados</p>
      </div>
    );
  }

  const getMovementTypeLabel = (type: MovementType) => {
    const labels = {
      [MovementType.IN]: 'Entrada',
      [MovementType.OUT]: 'Salida',
      [MovementType.ADJUSTMENT]: 'Ajuste',
    };
    return labels[type];
  };

  const getMovementTypeColor = (type: MovementType) => {
    const colors = {
      [MovementType.IN]: 'bg-green-100 text-green-800',
      [MovementType.OUT]: 'bg-red-100 text-red-800',
      [MovementType.ADJUSTMENT]: 'bg-blue-100 text-blue-800',
    };
    return colors[type];
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cantidad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Razón
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {movements.map((movement) => (
            <tr key={movement.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(movement.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  getMovementTypeColor(movement.type)
                }`}>
                  {getMovementTypeLabel(movement.type)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {movement.quantity}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {movement.reason}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {movement.createdBy}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MovementList;
