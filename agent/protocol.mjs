// Marina OS Agent: deterministic proposal and permission boundary.
// Pure, dependency-free module. No AI calls, secrets, network or production data.
export const PROPOSAL_STATES = Object.freeze(["proposed","accepted","deferred","rejected","tested","adopted"]);
export const RULE_STATES = Object.freeze(["proposed","tested","adopted","rejected"]);
export const HUMAN_APPROVAL_REQUIRED = Object.freeze(["payment","send_message","publish_content","calendar_write"]);
export const PASSIVE_ACTIONS = Object.freeze(["analyse","draft","research","compare_options","find_integration","review_evidence"]);
const PROJECT_ID = /^P\d{3}$/;
const UUIDISH = /^[a-z0-9-]{20,80}$/i;
const now = () => new Date().toISOString();

function requireText(value,name,max=1000) {
  if (typeof value !== "string" || !value.trim() || value.length>max) throw new Error(name+" must be non-empty text under "+max+" characters");
  return value.trim();
}
function requireEvidence(value) {
  if (!Array.isArray(value)||!value.length)throw new Error("At least one source evidence reference is required");
  return value.map(x=>requireText(x,"Evidence",500));
}
function requireProject(id) {
  if (typeof id!=="string"||!PROJECT_ID.test(id))throw new Error("Unknown project ID format");
  return id;
}
export function createOpportunity(input) {
  if (!input||typeof input!=="object")throw new Error("Invalid opportunity");
  const type=requireText(input.type,"Type",80);
  if (!PASSIVE_ACTIONS.includes(type))throw new Error("Only bounded, passive proposals are accepted");
  return Object.freeze({
    id:requireText(input.id,"ID",80),
    projectId:requireProject(input.projectId),
    type,
    observedNeed:requireText(input.observedNeed,"Observed need",2000),
    evidence:requireEvidence(input.evidence),
    proposedWork:requireText(input.proposedWork,"Proposed work",3000),
    expectedOutput:requireText(input.expectedOutput,"Expected output",1000),
    tradeoffs:requireText(input.tradeoffs,"Tradeoffs",1000),
    estimatedMinutes:Number.isFinite(input.estimatedMinutes)&&input.estimatedMinutes>=0&&input.estimatedMinutes<=10080?input.estimatedMinutes:null,
    permissionsRequested:(input.permissionsRequested||[]).map(v=>requireText(v,"Permission",100)),
    status:"proposed",
    createdAt:now()
  });
}
export function acceptFeedback(proposal,choice,comment="") {
  if (!PROPOSAL_STATES.includes(choice)||!["accepted","deferred","rejected"].includes(choice))throw new Error("Unsupported feedback");
  if (!["proposed","deferred"].includes(proposal.status))throw new Error("Already decided: create a revision");
  return Object.freeze({...proposal,status:choice,feedback:typeof comment==="string"?comment.slice(0,1500):"",decidedAt:now()});
}
export function createOperation(input) {
  if (!input||typeof input!=="object")throw new Error("Invalid operation");
  const command=requireText(input.command,"Command",80);
  if (![...HUMAN_APPROVAL_REQUIRED,"task_create","task_update","waiting_update"].includes(command))throw new Error("Command not allowlisted");
  const expectedVersion=requireText(input.expectedVersion,"Expected record version",128);
  const evidence=requireEvidence(input.evidence);
  const id=requireText(input.id,"Operation ID",80);
  if (!UUIDISH.test(id))throw new Error("Operation ID must be a stable idempotency key");
  const permission=HUMAN_APPROVAL_REQUIRED.includes(command)?"human_approval":"gateway_validation";
  return Object.freeze({id,command,projectId:requireProject(input.projectId),sourceRecordId:requireText(input.sourceRecordId,"Source record ID",180),expectedVersion,evidence,permission,approvalId:null,status:"proposed",payload:input.payload||{},createdAt:now()});
}
export function approveOperation(operation,approval) {
  if (operation.status!=="proposed")throw new Error("Operation is no longer awaiting approval");
  if (operation.permission==="human_approval") {
    if (!approval||approval.actor!=="Marina"||approval.operationId!==operation.id||approval.approved!==true||typeof approval.approvalId!=="string"||approval.approvalId.length<12)
      throw new Error("Explicit matching Marina approval required");
  }
  return Object.freeze({...operation,status:"approved_for_gateway",approvalId:approval?.approvalId||null,approvedAt:now()});
}
export function validateGatewayExecution(operation,{currentVersion,knownProjectIds,seenOperationIds}={}) {
  if (operation.status!=="approved_for_gateway")throw new Error("Operation has not been approved or validated");
  if (!Array.isArray(knownProjectIds)||!knownProjectIds.includes(operation.projectId))throw new Error("Project not present in registry");
  if (currentVersion!==operation.expectedVersion)throw new Error("Source record changed: reload and reconcile");
  if (seenOperationIds?.has(operation.id))throw new Error("Duplicate operation id");
  if (operation.permission==="human_approval"&&!operation.approvalId)throw new Error("Human approval missing");
  return {eligible:true,operationId:operation.id,requiresReadback:true};
}
export function recordLearning({proposalId,correction,source,rule,reviewer,stage="proposed"}) {
  if (!RULE_STATES.includes(stage))throw new Error("Unknown learning stage");
  return Object.freeze({proposalId:requireText(proposalId,"Proposal ID",80),correction:requireText(correction,"Correction",2000),source:requireText(source,"Source",500),proposedRule:requireText(rule,"Rule",2000),reviewer:requireText(reviewer,"Reviewer",100),stage,recordedAt:now()});
}
