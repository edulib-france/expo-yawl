const parseResponse = (resp) => resp.json();

const getResponse = (r) => (r && r.response ? r.response : r);

async function fetchGuard(requestUrl, options = {}) {
  try {
    const resp = await fetch(requestUrl, options);
    const r = await parseResponse(resp);
    return getResponse(r);
  } catch (err) {
    console.error(err);
  }
}

export default (url, params) =>
  fetchGuard(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

async function fetchGuardUnsafe(requestUrl, options = {}) {
  return await fetch(requestUrl, options);
}

export function postFetchUnsafe(url, params) {
  return fetchGuardUnsafe(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
}
