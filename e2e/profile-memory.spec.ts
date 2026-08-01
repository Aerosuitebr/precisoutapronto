import { expect, test } from '@playwright/test';
import { createEmptyContrato } from '../src/lib/contratos/defaults';
import { createEmptyResume } from '../src/lib/curriculo/defaults';
import {
  applyProfileToContract,
  applyProfileToProposal,
  applyProfileToReceipt,
  applyProfileToResume,
  normalizeProfileMemory
} from '../src/lib/profile-memory';
import { createEmptyProposal } from '../src/lib/propostas/defaults';
import { createEmptyReceipt } from '../src/lib/recibos/defaults';

const profile = {
  companyName: 'Studio Horizonte',
  occupation: 'Designer de produtos'
};

test('normaliza somente a memória útil e limita o tamanho dos campos', () => {
  expect(normalizeProfileMemory(null)).toBeNull();
  expect(normalizeProfileMemory({ companyName: '  Empresa X  ', occupation: '  ' })).toEqual({
    companyName: 'Empresa X',
    occupation: ''
  });
  expect(normalizeProfileMemory({ companyName: 'x'.repeat(140), occupation: 123 })).toEqual({
    companyName: 'x'.repeat(120),
    occupation: ''
  });
});

test('preenche somente campos vazios dos quatro tipos de documento', () => {
  const contract = applyProfileToContract(createEmptyContrato(), profile);
  expect(contract.document.partyA.name).toBe(profile.companyName);
  expect(contract.document.partyA.profession).toBe(profile.occupation);
  expect(contract.applied).toEqual(['partyA.name', 'partyA.profession']);

  expect(applyProfileToResume(createEmptyResume(), profile).document.personal.headline).toBe(
    profile.occupation
  );
  expect(applyProfileToReceipt(createEmptyReceipt(), profile).document.receiver.name).toBe(
    profile.companyName
  );
  const proposal = applyProfileToProposal(createEmptyProposal(), profile);
  expect(proposal.document.company.name).toBe(profile.companyName);
  expect(proposal.document.signature.text).toBe(profile.companyName);
});

test('nunca sobrescreve conteúdo já informado', () => {
  const contract = createEmptyContrato();
  contract.partyA.name = 'Nome existente';
  contract.partyA.profession = 'Profissão existente';
  expect(applyProfileToContract(contract, profile)).toEqual({ document: contract, applied: [] });

  const resume = createEmptyResume();
  resume.personal.headline = 'Título existente';
  expect(applyProfileToResume(resume, profile)).toEqual({ document: resume, applied: [] });

  const receipt = createEmptyReceipt();
  receipt.receiver.name = 'Recebedor existente';
  expect(applyProfileToReceipt(receipt, profile)).toEqual({ document: receipt, applied: [] });

  const proposal = createEmptyProposal();
  proposal.company.name = 'Empresa existente';
  proposal.signature.text = 'Assinatura existente';
  expect(applyProfileToProposal(proposal, profile)).toEqual({ document: proposal, applied: [] });
});
