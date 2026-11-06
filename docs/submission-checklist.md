# SwitchAI — Hackathon Submission Checklist

## Hackathon: Flip the Switch Hackathon by WeMakeDevs and Switch AI
## Track: Best Business Workflow

---

## Pre-Submission Checklist

### Code & Functionality

- [ ] Application runs locally without external API keys
- [ ] All three AI agents produce distinct, meaningful analysis
- [ ] Complete incident workflow: create → triage → investigate → fix → approve → resolve
- [ ] Human approval/rejection works correctly
- [ ] Activity timeline updates in real-time
- [ ] Dashboard shows correct statistics
- [ ] Team Room displays collaboration messages
- [ ] Settings page shows honest integration status

### Switch Integration

- [ ] Integration architecture is documented
- [ ] Adapter pattern separates Switch from business logic
- [ ] Local demo adapter works without Switch credentials
- [ ] Switch protocol adapter scaffold is in place
- [ ] `SWITCH_ENABLED` flag controls adapter selection
- [ ] Integration steps are documented in `docs/switch-integration.md`

### Documentation

- [ ] README.md is complete and professional
- [ ] Architecture documented in `docs/architecture.md`
- [ ] Switch integration documented in `docs/switch-integration.md`
- [ ] Demo guide available in `docs/demo-guide.md`
- [ ] Environment variables documented in `.env.example`

### Code Quality

- [ ] No real credentials in codebase
- [ ] `.env` is in `.gitignore`
- [ ] Only `.env.example` is committed
- [ ] No fake "connected" statuses displayed
- [ ] Input validation on API endpoints
- [ ] Error handling throughout
- [ ] No arbitrary command execution

### Build & Test

- [ ] `npm install` works for both server and client
- [ ] Backend tests pass
- [ ] Frontend builds without errors
- [ ] Production build works

### Git

- [ ] Clean, meaningful commit history
- [ ] No sensitive data in any commit
- [ ] Repository is public (or shared with judges)

---

## Submission Materials

### Required

1. **GitHub Repository URL:** https://github.com/Jisukumarmishra/SwitchAi
2. **README.md** — Included in repository
3. **Demo Video** — Record using the script in `docs/demo-guide.md`

### Recommended

4. **Live Demo** — Optional, application works locally
5. **Architecture Diagram** — Included in `docs/architecture.md`
6. **Screenshots** — Add to `docs/screenshots/` directory

---

## Recording the Demo Video

1. Open the application (both backend and frontend running)
2. Follow the 5-minute demo script in `docs/demo-guide.md`
3. Highlight:
   - Multi-agent collaboration (not a single chatbot)
   - Human-in-the-loop approval
   - Switch integration architecture
   - Real-time event streaming
   - Professional UI/UX

### Video Tips

- Keep it under 5 minutes
- Show the workflow end-to-end
- Explain while demonstrating
- Highlight what makes SwitchAI unique
- Mention the Switch integration architecture

---

## After Submission

### Manual Steps for Full Integration

1. **Switch Integration**
   - Obtain Switch API credentials
   - Implement `switchProtocolAdapter.js`
   - Test with a real Switch room
   - See `docs/switch-integration.md`

2. **Real AI Provider** (optional)
   - Set `LLM_PROVIDER=openai` in `.env`
   - Add `OPENAI_API_KEY`
   - Implement OpenAI provider in `server/providers/`

3. **MongoDB** (optional)
   - Set `DATA_MODE=mongodb` in `.env`
   - Set `MONGODB_URI`
   - Implement MongoDB repository

---

## Judging Criteria Alignment

| Criteria | How SwitchAI Addresses It |
|----------|--------------------------|
| **Business Workflow** | Complete DevOps incident management lifecycle |
| **Switch Integration** | Prepared adapter architecture for Switch rooms |
| **AI Agents** | Three specialized agents with distinct roles |
| **Collaboration** | Humans and AI agents work together with approval gates |
| **Technical Quality** | Clean architecture, tests, documentation |
| **Demo Quality** | Polished UI, realistic demo data, repeatable workflow |
