import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agentsApi } from "../lib/api.js";
import { useAuthStore } from "../store/auth.js";
import { Modal, FormGroup, Input, Textarea, Select } from "../components/ui/Modal.js";
import { Button } from "../components/ui/Button.js";

interface NewAgentModalProps {
  onClose: () => void;
}

const MODELS = [
  "llama3:latest",
  "qwen2.5-coder:latest",
  "gemma4:26b",
];

export function NewAgentModal({ onClose }: NewAgentModalProps) {
  const companyId   = useAuthStore((s) => s.companyId)!;
  const queryClient = useQueryClient();

  const [name,   setName]   = useState("");
  const [role,   setRole]   = useState("");
  const [model,  setModel]  = useState("llama3.1:8b");
  const [prompt, setPrompt] = useState("");

  const create = useMutation({
    mutationFn: () =>
      agentsApi.create(companyId, {
        name,
        role,
        model,
        systemPrompt: prompt,
        monthlyTokenLimit: 100000,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      onClose();
    },
  });

  return (
    <Modal
      title="Add agent"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => create.mutate()}
            disabled={!name.trim() || !role.trim() || create.isPending}
          >
            {create.isPending ? "Adding…" : "Add agent"}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FormGroup label="Name">
          <Input
            placeholder="Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </FormGroup>
        <FormGroup label="Role">
          <Input
            placeholder="Software Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </FormGroup>
      </div>

      <FormGroup label="Ollama model">
        <Select value={model} onChange={(e) => setModel(e.target.value)}>
          {MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup label="System prompt">
        <Textarea
          rows={3}
          placeholder="You are a helpful software engineer. Complete tasks efficiently and write clean code."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </FormGroup>
    </Modal>
  );
}