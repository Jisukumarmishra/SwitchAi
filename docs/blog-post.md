# Building SwitchAI: Putting Incident Response in the Conversation

*Draft blog post — review the project status and replace any team-specific details before publishing.*

Software incidents are rarely solved by one alert or one person. A developer reports a failure, someone gathers logs, another person checks deployments, and a human decides what to do next. For our SwitchAI prototype, we wanted to make that handoff visible in one chronological conversation.

## From report to review

SwitchAI's local demo begins with a bug report in the Team Chat page. The backend creates an incident record and passes it through three specialized roles:

- **Triage** classifies the report and assesses its stated severity.
- **Investigation** reviews any supplied logs and records whether deployment evidence is available.
- **Fix & Release** proposes remediation steps and risks for a human to review.

The agents run sequentially. After each one finishes, the orchestrator stores its findings on the incident and passes the updated record along. The browser receives progress events and displays them beside the original report, so the workflow can be followed without losing the incident context.

## A shared record instead of direct agent chat

The prototype uses the incident record as a handoff mechanism. It is a useful way to make the workflow inspectable: triage findings, investigation notes, and a remediation proposal are attached to the same incident and shown in its timeline.

That design has an important limit. The agents do not message each other directly, and the current mock provider does not reliably reason from earlier findings. The demo demonstrates orchestration and visibility; it is not yet an autonomous coding team.

## Where Switch fits today

The repository contains a Switch adapter boundary and a local in-process demo adapter. In local mode, the backend registers the Triage, Investigation, and Fix & Release agent definitions with a demo room. The browser chat is a local UI backed by incident history.

We have not connected this checkout to a real Switch service or Mattermost channel. The protocol adapter methods still need implementation and verification against Switch's supported API. We are documenting that distinction rather than presenting a local event emitter as a live Switch integration.

## Keeping people in control

The workflow ends in `awaiting_approval`. The current demo does not change source files, run repository tests, create a branch, or open a pull request. Its incident approval action records a decision and adds a simulated rollback event; it does not touch production systems. Those boundaries are visible in the UI and README so that the demo does not overstate what it can do.

## What comes next

The next steps are to connect a real Switch room, make agent handoffs consume previous findings, and add a small sample code repository that can be inspected and tested. Only after that should the workflow claim code changes or GitHub pull requests. A small, verifiable workflow is a better milestone than a broad claim the demo cannot support yet.

SwitchAI is currently a local prototype of the conversation and orchestration experience. The work ahead is to connect that experience to real team collaboration and evidence-backed code changes.
