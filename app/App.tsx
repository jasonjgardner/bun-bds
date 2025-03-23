import { useCallback, useState } from "react";

export default function App() {
  const [result, setResult] = useState<string | null>(null);
  const [tables, setTables] = useState<Array<{ name: string }>>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<any>(null);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: form.method,
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { result } = await response.json();
      
      setResult(result ? JSON.stringify(result, null, 2) : "No result");
    },
    []
  );

  const fetchSchema = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/schema");
      const { results } = await response.json();
      setTables(results);
    } catch (error) {
      console.error("Error fetching schema:", error);
    } finally {
      setLoading(false);
    }
  }, [
    setLoading,
    setTables,
  ]);

  const viewTable = useCallback(async (tableName: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/query", {
        method: "POST",
        body: JSON.stringify({ sql: `SELECT * FROM ${tableName} LIMIT 100` }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setTableData(data.results);
    } finally {
      setLoading(false);
    }
  }, [
    setLoading,
    setTableData,
  ]);

  const handleEdit = (rowIndex: number) => {
    setEditingRow(rowIndex);
    setEditedData({...tableData[rowIndex]});
  };

  const handleSave = async (tableName: string, rowData: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/query", {
        method: "POST",
        body: JSON.stringify({
          sql: `UPDATE ${tableName} SET ${Object.keys(rowData)
            .map(key => `${key} = ?`)
            .join(', ')} WHERE id = ?`,
          params: [...Object.values(rowData), rowData.id]
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        await viewTable(tableName);
      }
    } finally {
      setLoading(false);
      setEditingRow(null);
      setEditedData(null);
    }
  };

  const handleDelete = async (tableName: string, id: number) => {
    if (!confirm('Are you sure you want to delete this row?')) return;
    setLoading(true);
    try {
      const response = await fetch("/api/query", {
        method: "POST",
        body: JSON.stringify({
          sql: `DELETE FROM ${tableName} WHERE id = ?`,
          params: [id]
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        await viewTable(tableName);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <form action="/bds/commands" method="POST" onSubmit={handleSubmit}>
          <textarea name="command" placeholder="time set day"></textarea>
          <input type="hidden" name="sender" value="console" />
          <input type="submit" />
        </form>
        {result && <pre>{result}</pre>}
      </div>

      <div>
        <h2>Database Explorer</h2>
        <button onClick={fetchSchema} disabled={loading}>
          Load Tables
        </button>
        {loading && <span>Loading...</span>}
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <div>
            {Array.isArray(tables) && tables.length > 0 ? tables.map((table: { name: string }) => (
              <div key={table.name}>
                <button onClick={() => viewTable(table.name)}>
                  {table.name}
                </button>
              </div>
            )) : (
              <div>No tables found</div>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            {tableData.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {Object.keys(tableData[0]).map(key => (
                      <th key={key} style={{ border: '1px solid #ccc', padding: '8px' }}>
                        {key}
                      </th>
                    ))}
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i}>
                      {Object.entries(row).map(([key, value], j) => (
                        <td key={j} style={{ border: '1px solid #ccc', padding: '8px' }}>
                          {editingRow === i ? (
                            <input
                              value={editedData[key]}
                              onChange={(e) => setEditedData({
                                ...editedData,
                                [key]: e.target.value
                              })}
                            />
                          ) : (
                            JSON.stringify(value)
                          )}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                        {editingRow === i ? (
                          <button onClick={() => handleSave(tables[0].name, editedData)}>
                            Save
                          </button>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(i)}>Edit</button>
                            <button onClick={() => handleDelete(tables[0].name, row.id)}>
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
