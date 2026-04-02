const DEFAULT_BASE = "http://localhost:5000";

function getBaseUrl() {
  return (process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE).replace(/\/+$/, "");
}

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function errorFromResponse(res, data) {
  if (data?.errors?.length) return new Error(data.errors.join(" "));
  if (data?.message) return new Error(data.message);
  return new Error(`${res.status} ${res.statusText}`.trim());
}

export async function apiGetMembers() {
  const res = await fetch(`${getBaseUrl()}/api/members`);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw errorFromResponse(res, data);
  return Array.isArray(data) ? data : [];
}

export async function apiCreateMember(payload) {
  const res = await fetch(`${getBaseUrl()}/api/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw errorFromResponse(res, data);
  return data;
}

export async function apiUpdateMember(id, payload) {
  const res = await fetch(`${getBaseUrl()}/api/members/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw errorFromResponse(res, data);
  return data;
}

export async function apiDeleteMember(id) {
  const res = await fetch(`${getBaseUrl()}/api/members/${id}`, { method: "DELETE" });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw errorFromResponse(res, data);
  return data;
}

