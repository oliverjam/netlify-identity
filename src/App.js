import React from "react";
import netlifyIdentity from "netlify-identity-widget";

function App() {
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    // Set up identity when app loads
    netlifyIdentity.init();

    // get current user (if they're already logged in)
    const netlifyUser = netlifyIdentity.currentUser();
    if (netlifyUser) setUser(netlifyUser);

    // when they log in via the popup put the user into state
    netlifyIdentity.on("login", () => {
      netlifyIdentity.close();
      setUser(netlifyUser);
    });

    // when they log out via the popup remove the user from the state
    netlifyIdentity.on("logout", () => {
      netlifyIdentity.close();
      setUser(null);
    });
  }, []);
  return (
    <div>
      {user ? (
        <button onClick={() => netlifyIdentity.logout()}>Log out</button>
      ) : (
        <button onClick={() => netlifyIdentity.open()}>Log in</button>
      )}
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

export default App;
