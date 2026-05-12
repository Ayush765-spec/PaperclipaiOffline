import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi, agentsApi } from "../lib/api.js";
import { useAuthStore } from "../store/auth.js";
import { Modal, FormGroup, Input, Textarea, Select } from "../components/ui/Modal.js";
import { Button } from "../components/ui/Button.js";

interface NewTaskModalProps {
  onClose: () => void;
}

export function NewTaskModal({ onClose }: NewTaskModalProps) {
  const companyId   = useAuthStore((s) => s.companyId)!;
  const queryClient = useQueryClient();

  const [title, setTitle]   = useState("");
  const [desc,  setDesc]    = useState("");
  const [agentId, setAgentId] = useState("");

  const { data: agents = [] } = useQuery({
    queryKey: ["agents", companyId],
    queryFn:  () => agentsApi.list(companyId),
  });

  const create = useMutation({
    mutationFn: () =>
      tasksApi.create(companyId, {
        agentId,
        title,
        description: desc,
        priority: 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onClose();
    },
  });

  return (
    <Modal
      title="New task"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={() => create.mutate()}
            disabled={!title.trim() || !agentId || create.isPending}
          >
            {create.isPending ? "Creating…" : "Create task"}
          </Button>
        </>
      }
    >
      <FormGroup label="Title">
        <Input
          placeholder="What should the agent do?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </FormGroup>

      <FormGroup label="Description">
        <Textarea
          rows={3}
          placeholder="Add context, requirements, or constraints…"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </FormGroup>

      <FormGroup label="Assign to">
        <Select value={agentId} onChange={(e) => setAgentId(e.target.value)}>
          <option value="">Select an agent…</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} — {a.role}
            </option>
          ))}
        </Select>
      </FormGroup>
    </Modal>
  );
}