import { TRANSACTIONS } from "../../data/mockData";

interface Props {
  darkMode: boolean;
}

export default function TransactionsTable({ darkMode }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full text-sm text-left">
        <thead
          className={`border-b ${
            darkMode
              ? "bg-[#161e2d] text-gray-400 border-gray-700"
              : "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          <tr>
            <th className="px-5 py-3.5 font-semibold uppercase text-xs tracking-wider">Service</th>
            <th className="px-5 py-3.5 font-semibold uppercase text-xs tracking-wider">Date</th>
            <th className="px-5 py-3.5 font-semibold uppercase text-xs tracking-wider">Status</th>
            <th className="px-5 py-3.5 font-semibold uppercase text-xs tracking-wider text-right">Amount</th>
          </tr>
        </thead>

        <tbody>
          {TRANSACTIONS.map((tx, idx) => (
            <tr
              key={tx.id}
              className={`border-b transition-all duration-150 ${
                darkMode
                  ? "border-gray-700 hover:bg-[#2a384b] text-gray-300"
                  : "border-gray-100 hover:bg-gray-50 text-gray-700"
              } ${idx === TRANSACTIONS.length - 1 ? 'border-b-0' : ''}`}
            >
              <td className={`px-5 py-4 font-semibold ${darkMode ? "text-gray-200" : "text-[#232f3e]"}`}>
                {tx.service}
              </td>

              <td className={`px-5 py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {tx.date}
              </td>

              <td className="px-5 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${
                    tx.status === "Completed"
                      ? darkMode
                        ? "bg-green-900/30 text-green-400 border border-green-700/50"
                        : "bg-green-100 text-green-700 border border-green-200"
                      : darkMode
                        ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700/50"
                        : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {tx.status}
                </span>
              </td>

              <td className={`px-5 py-4 text-right font-bold ${darkMode ? "text-white" : "text-[#232f3e]"}`}>
                {tx.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
