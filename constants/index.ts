export const headerLinks = [
  {
    label: "Home",
    route: "/",
  },
  {
    label: "Explore",
    route: "/explore",
  },
  {
    label: "My Profile",
    route: "/profile",
  },
];

export const eventDefaultValues = {
  title: "",
  description: "",
  location: "",
  imageUrl: "",
  startDateTime: new Date(),
  endDateTime: new Date(),
  categoryId: "",
  url: "",
  hasMultipleTicketTypes: false,
  ticketTypes: [
    {
      name: "General",
      price: 0,
      quantity: 100,
    },
  ],
};
