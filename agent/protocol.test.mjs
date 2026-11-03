import test from "node:test";
import assert from "node:assert/strict";
import {createOpportunity,acceptFeedback,createOperation,approveOperation,validateGatewayExecution,recordLearning} from "./protocol.mjs";

const opportunity=()=>createOpportunity({
 id:"opp-00000000-0000-4000-8000-000000000001",projectId:"P001",type:"find_integration",
 observedNeed:"Repeated manual bill verification",evidence:["synthetic:invoice:0001"],
 proposedWork:"Investigate whether a provider offers a read-only billing API",
 expectedOutput:"An integration feasibility matrix",tradeoffs:"API permission and cost",
 estimatedMinutes:25,permissionsRequested:["read public API documentation"]
});
test("proposes grounded, passive work",()=>{
 const p=opportunity();
 assert.equal(p.status,"proposed");
 assert.equal(p.evidence.length,1);
 assert.equal(acceptFeedback(p,"rejected","Not useful").status,"rejected");
});
test("rejects vague ungrounded or direct execution as a suggestion",()=>{
 assert.throws(()=>createOpportunity({...opportunity(),evidence:[]}),/evidence/i);
 assert.throws(()=>createOpportunity({id:"x",projectId:"P001",type:"payment",observedNeed:"x",evidence:["x"],proposedWork:"x",expectedOutput:"x",tradeoffs:"x"}),/passive/);
});
const operation=()=>createOperation({
 id:"11111111-1111-4111-8111-111111111111",projectId:"P001",
 command:"payment",sourceRecordId:"bill:cycle:2026-11",
 expectedVersion:"version-1",evidence:["synthetic:payment:invoice"],payload:{amount:12}
});
test("payment needs explicit matching human approval",()=>{
 const o=operation();
 assert.equal(o.permission,"human_approval");
 assert.throws(()=>approveOperation(o),/approval/);
 assert.throws(()=>approveOperation(o,{actor:"Marina",operationId:"other",approvalId:"approval-123456",approved:true}),/approval/);
 const accepted=approveOperation(o,{actor:"Marina",operationId:o.id,approvalId:"approval-123456",approved:true});
 assert.deepEqual(validateGatewayExecution(accepted,{currentVersion:"version-1",knownProjectIds:["P001"],seenOperationIds:new Set()}),{eligible:true,operationId:o.id,requiresReadback:true});
});
test("blocks stale, unknown, duplicate and unapproved operations",()=>{
 const o=operation();
 assert.throws(()=>validateGatewayExecution(o,{currentVersion:"version-1",knownProjectIds:["P001"]}),/approved/);
 const ok=approveOperation(o,{actor:"Marina",operationId:o.id,approvalId:"approval-123456",approved:true});
 assert.throws(()=>validateGatewayExecution(ok,{currentVersion:"version-2",knownProjectIds:["P001"]}),/changed/);
 assert.throws(()=>validateGatewayExecution(ok,{currentVersion:"version-1",knownProjectIds:["P027"]}),/Project/);
 assert.throws(()=>validateGatewayExecution(ok,{currentVersion:"version-1",knownProjectIds:["P001"],seenOperationIds:new Set([o.id])}),/Duplicate/);
});
test("corrections stay proposals until reviewed",()=>{
 assert.equal(recordLearning({proposalId:"opp-1",correction:"Invoice already settled",source:"synthetic:receipt",rule:"Check provider settlement before reminding",reviewer:"Marina"}).stage,"proposed");
});
