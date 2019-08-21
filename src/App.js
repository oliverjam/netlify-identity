import React from "react";
import netlifyIdentity from "netlify-identity-widget";

let counter = 0;

function App() {
  const [auth, setAuth] = React.useState("loading");
  const [todos, setTodos] = React.useState([]);

  React.useEffect(() => {
    // Set up identity when app loads
    netlifyIdentity.init();

    // try to log them in straight away
    login();

    // when they log in via the popup
    netlifyIdentity.on("login", () => {
      login();
      netlifyIdentity.close();
    });

    // when they log out via the popup
    netlifyIdentity.on("logout", () => {
      setAuth("loggedOut");
      netlifyIdentity.close();
    });
  }, []);

  function login() {
    const user = netlifyIdentity.currentUser();
    if (user) {
      setAuth("loggedIn");
      if (user.user_metadata.todos) {
        setTodos(user.user_metadata.todos);
      }
    }
  }

  function getId() {
    if (todos.length > 0) {
      // if we have existing todos we want to increment IDs starting at the
      // highest previous value
      const highestPrevId = todos.reduce(
        (currentMax, todo) => (todo.id > currentMax ? todo.id : currentMax),
        0
      );
      return highestPrevId + 1;
    }
    // otherwise use the local counter
    return counter++;
  }

  function addTodo(text) {
    const id = getId();
    const user = netlifyIdentity.currentUser();
    const oldTodos = user.user_metadata.todos;
    user
      .update({ data: { todos: [...oldTodos, { id, text }] } })
      .then(updatedUser => {
        // update successful, put the result into state to re-render
        setTodos(updatedUser.user_metadata.todos);
      });
  }

  function deleteTodo(id) {
    const user = netlifyIdentity.currentUser();
    const newTodos = user.user_metadata.todos.filter(todo => todo.id !== id);
    user.update({ data: { todos: newTodos } }).then(updatedUser => {
      // update successful, put the result into state to re-render
      setTodos(updatedUser.user_metadata.todos);
    });
  }

  function deleteAllTodos() {
    const confirm = window.confirm("Permanently delete all your todos?");
    if (confirm) {
      user.update({ data: { todos: [] } }).then(() => setTodos([]));
    }
  }

  if (auth === "loading")
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );

  if (auth === "loggedOut") {
    return (
      <div>
        <h1>Logged out</h1>
        <button onClick={() => netlifyIdentity.open()}>Log in</button>
      </div>
    );
  }

  const user = netlifyIdentity.currentUser();
  return (
    <div>
      <h1>{user.email}</h1>
      <button onClick={() => netlifyIdentity.logout()}>Log out</button>
      <h2>Todos</h2>
      <form
        onSubmit={event => {
          event.preventDefault();
          const { value } = event.target.elements.addTodo;
          addTodo(value);
          event.target.reset();
        }}
      >
        <label htmlFor="addTodo">Add todo</label>
        <input id="addTodo" required />
      </form>
      {todos.length > 0 && (
        <>
          <ul>
            {todos.map(todo => (
              <li key={todo.id}>
                {todo.text}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="Delete todo"
                >
                  ⨉
                </button>
              </li>
            ))}
          </ul>
          <button
            style={{
              border: 0,
              fontSize: "inherit",
              background: "red",
              color: "white"
            }}
            onClick={deleteAllTodos}
          >
            Clear todos
          </button>
        </>
      )}
    </div>
  );
}

export default App;
