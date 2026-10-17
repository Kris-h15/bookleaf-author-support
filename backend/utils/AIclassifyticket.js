// classify category of ticket based on subject and description of the message

async function AIclassifyticket(subject, description) {
  const text = `${subject} ${description}`.toLowerCase();

  // AI-api call to decide category
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/tickets/AI-cat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    },
  );

  let data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  console.log(data);
  return data.data;
}

module.exports = AIclassifyticket;
