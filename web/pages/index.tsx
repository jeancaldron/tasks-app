import "bootstrap/dist/css/bootstrap.min.css";
import type { Task } from "../interfaces";
import useSwr from "swr";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { useState } from "react";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    const response = res.json();
    return response;
  });

export default function Index() {
  const { data, mutate, error, isLoading, isValidating } = useSwr<Task[]>(
    "http://localhost:4000/tasks",
    fetcher
  );
  const [taskText, setTaskText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  if (error) return <div>Failed to load users</div>;
  if (isLoading || isValidating || isUpdating) return <div>Loading...</div>;
  if (!data) return null;

  const createTask = async () => {
    setIsUpdating(true);
    await fetch("http://localhost:4000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: taskText }),
    })

    const newTask = { id: Date.now(), text: taskText, completed: false };
    mutate([...data, newTask], false);
    setIsUpdating(false);
  };

  const markAsCompletedOrUncomplete = async (id: number) => {
    setIsUpdating(true);
    await fetch(`http://localhost:4000/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const updatedTasks = data.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    mutate(updatedTasks, false);
    setIsUpdating(false);
  };

  const deleteTask = async (id: number) => {
    setIsUpdating(true);
    await fetch(`http://localhost:4000/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const updatedTasks = data.filter(task => task.id !== id);
    mutate(updatedTasks, false);
    setIsUpdating(false);
  };

  return (
    <>
      <h1>{`Tasks (${data.length})`}</h1>
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="text"
          aria-label="text"
          onChange={(e) => setTaskText(e.target.value)}
        />
        <Button
          onClick={() => createTask()}
          variant="outline-secondary"
          id="button-addon2"
        >
          Create
        </Button>
      </InputGroup>
      {data.map((task) => (
        <InputGroup className="mb-3" key={task.id}>
          <Form.Control
            placeholder="text"
            aria-label="text"
            value={task.text}
            readOnly
          ></Form.Control>
          <Form.Control
            checked={task.completed}
            value={task.completed ? "completed" : "uncompleted"}
            readOnly
          />
          <Button onClick={() => markAsCompletedOrUncomplete(task.id)}>
            Mark as completed
          </Button>
          <Button onClick={() => deleteTask(task.id)}>delete</Button>
        </InputGroup>
      ))}
    </>
  );
}
