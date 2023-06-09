const URI = "https://yuliageneralova.ru";

const req = (url, options = {}) => {
  const { body } = options;

  return fetch(url, {
    ...options,
    body: body ? JSON.stringify(body) : null,
    headers: {
      ...options.headers,
      ...(body
        ? {
            "Content-Type": 'application/json',
          }
        : null),
    },
  }).then((res) =>
    res.ok
      ? res.json()
      : res.text().then((message) => {
          throw new Error(message);
        })
  );
};

export const getNotes = async ({ age, search, page } = {}) => {
  const fetchReq = req(`${URI}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: { age, search, page },
  });
  let res = await fetchReq;
  console.log(res)
  return res;
};

export const createNote = async (title, text) => {
  const fetchReq = req(`${URI}/notes/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: { title, text },
  });
  let res = await fetchReq;
  return res;
};

export const getNote = async (id) => {
  const fetchReq = req(`${URI}/notes?id=${id}`, {
    method: "GET",
  });
  let res = await fetchReq;
  return res;
};

export const archiveNote = async (id) => {
  const fetchReq = req(`${URI}/notes/archive`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: { id, archive: true },
  });
  let res = await fetchReq;
  return res;
};

export const unarchiveNote = async (id) => {
  const fetchReq = req(`${URI}/notes/archive`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: { id, archive: false },
  });
  let res = await fetchReq;
  return res;
};

export const editNote = async (id, title, text) => {
  const fetchReq = req(`${URI}/notes`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: { title, text, id },
  });
  let res = await fetchReq;
  return res;
};

export const deleteNote = async (id) => {
  const fetchReq = req(`${URI}/notes?id=${id}`, {
    method: "DELETE",
  });
  let res = await fetchReq;
  return res;
};

export const deleteAllArchived = async () => {
  const fetchReq = req(`${URI}/notes?id=all`, {
    method: "DELETE",
  });
  let res = await fetchReq;
  return res;
};

export const notePdfUrl = (id) => {
  return `${URI}/notes/pdf?id=${id}`;
};
