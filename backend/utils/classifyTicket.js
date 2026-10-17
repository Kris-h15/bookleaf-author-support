// classify category of ticket based on subject and description of the message

function classifyTicket(subject, description) {
  const text = `${subject} ${description}`.toLowerCase();

  const rules = [
    {
      category: "Royalty",
      keywords: ["royalty", "payment", "payout", "earnings", "invoice"],
    },
    {
      category: "Publishing",
      keywords: ["publish", "publication", "isbn", "manuscript", "publisher"],
    },
    {
      category: "Book Changes",
      keywords: [
        "edit",
        "editing",
        "correction",
        "cover",
        "update book",
        "change book",
        "formatting",
      ],
    },
    {
      category: "Marketing",
      keywords: [
        "marketing",
        "promotion",
        "advertisement",
        "campaign",
        "social media",
      ],
    },
    {
      category: "Distribution",
      keywords: ["distribution", "availability", "shipping", "store", "amazon"],
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.category;
    }
  }

  return "Other";
}

module.exports = classifyTicket;
