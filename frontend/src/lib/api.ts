const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function fetchQueries(email: string) {
  const response = await fetch(`${API_URL}/api/queries/internalqueries/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function updateQuery(queryNumber: string, data: any) {
  const response = await fetch(`${API_URL}/api/queries/update/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      queryNumber,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function addComment(data: any) {
  const response = await fetch(`${API_URL}/api/queryhistory/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
 const result = await response.json()
  return result;
}