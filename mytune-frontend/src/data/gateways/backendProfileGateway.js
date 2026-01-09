export const createBackendProfileGateway = ({ http }) => ({
  me: () => http.get('/me/'),
  myReviews: () => http.get('/my-reviews/'),
});
