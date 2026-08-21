-- V003: versioned Intent Graph foundation and P0 seed. Additive only.
CREATE TABLE "intent_nodes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(80) NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "frequencyClass" VARCHAR(24) NOT NULL,
    "riskLevel" VARCHAR(24) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "intent_nodes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "intent_edges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fromNodeId" UUID NOT NULL,
    "toNodeId" UUID NOT NULL,
    "relationType" VARCHAR(32) NOT NULL,
    "weight" DECIMAL(6,3) NOT NULL,
    "transferSchema" JSONB NOT NULL DEFAULT '{}',
    "ruleJson" JSONB NOT NULL DEFAULT '{}',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "intent_edges_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "intent_edges_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "intent_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "intent_edges_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "intent_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "intent_nodes_key_key" ON "intent_nodes"("key");
CREATE INDEX "intent_nodes_type_active_idx" ON "intent_nodes"("type", "active");
CREATE UNIQUE INDEX "intent_edges_fromNodeId_toNodeId_relationType_key" ON "intent_edges"("fromNodeId", "toNodeId", "relationType");
CREATE INDEX "intent_edges_fromNodeId_active_idx" ON "intent_edges"("fromNodeId", "active");
CREATE INDEX "intent_edges_toNodeId_active_idx" ON "intent_edges"("toNodeId", "active");

INSERT INTO "intent_nodes" ("id", "key", "type", "label", "description", "frequencyClass", "riskLevel", "metadata", "updatedAt")
VALUES
    ('10000000-0000-4000-8000-000000000001', 'orcamentos', 'tool', 'Orçamentos', 'Criar, enviar e acompanhar orçamento profissional.', 'high', 'low', '{"seedVersion":1,"p0":true}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000002', 'recibos', 'tool', 'Recibos', 'Gerar comprovante de pagamento ou recebimento.', 'high', 'medium', '{"seedVersion":1,"p0":true}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000003', 'pix', 'tool', 'Pix', 'Gerar cobrança e QR Code Pix.', 'high', 'medium', '{"seedVersion":1,"p0":true}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000004', 'contratos', 'tool', 'Contratos', 'Formalizar condições de uma prestação de serviço.', 'medium', 'high', '{"seedVersion":1,"p0":true}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000005', 'propostas', 'tool', 'Propostas', 'Apresentar escopo, investimento e próximo passo.', 'medium', 'low', '{"seedVersion":1,"p0":true}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000006', 'precificacao', 'tool', 'Precificação', 'Calcular referência de preço para serviços.', 'medium', 'medium', '{"seedVersion":1,"p0":true}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000007', 'agenda', 'tool', 'Agenda', 'Organizar compromissos e próximos atendimentos.', 'high', 'low', '{"seedVersion":1,"p0":true}', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "intent_edges" ("fromNodeId", "toNodeId", "relationType", "weight", "transferSchema", "ruleJson", "updatedAt")
VALUES
    ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'next_action', 0.900, '{"version":1,"fields":[]}', '{"requiresOutcome":"completed"}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'next_action', 0.850, '{"version":1,"fields":[]}', '{"requiresOutcome":"completed"}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004', 'next_action', 0.650, '{"version":1,"fields":[]}', '{"requiresOutcome":"completed"}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000004', 'next_action', 0.800, '{"version":1,"fields":[]}', '{"requiresOutcome":"completed"}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', 'next_action', 0.900, '{"version":1,"fields":[]}', '{}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000001', 'next_action', 0.600, '{"version":1,"fields":[]}', '{}', CURRENT_TIMESTAMP),
    ('10000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000003', 'next_action', 0.550, '{"version":1,"fields":[]}', '{"requiresOutcome":"completed"}', CURRENT_TIMESTAMP)
ON CONFLICT ("fromNodeId", "toNodeId", "relationType") DO NOTHING;
