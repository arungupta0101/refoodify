export default function InventoryTable({ items = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-4 text-left">Product</th>
            <th className="p-4 text-left">Expiry</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="p-4">{item.name}</td>
              <td className="p-4">{item.expiry}</td>
              <td className="p-4">
                <button className="bg-primary text-white px-3 py-1 rounded text-sm">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}