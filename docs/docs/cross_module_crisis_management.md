# Crisis Management Workflow

## Overview
This cross-module workflow enables organizations to detect, analyze, respond to, and track brand crises in real-time using multiple Brandwatch modules working in concert.

## Business Value
- **Rapid Response**: Detect and respond to crises within minutes, not hours
- **Coordinated Management**: Unified response across all social channels
- **Data-Driven Decisions**: Base crisis response on real-time insights
- **Executive Visibility**: Keep stakeholders informed throughout the crisis
- **Continuous Learning**: Track recovery and document lessons learned

## Workflow Steps

### 📦 Step 1: Crisis Detection (Listen Module)
**Objective**: Set up real-time monitoring to detect potential crises early

**Key Actions**:
- Configure alerts for unusual mention volume spikes (>300% normal)
- Set up negative sentiment threshold alerts (>70% negative)
- Monitor crisis-related keywords and hashtags
- Track influencer mentions that could amplify issues

**Configuration Tips**:
```
Alert Conditions:
- Volume spike: 3x normal baseline
- Sentiment drop: Below 30% positive
- Influencer mentions: Any verified account with >10K followers
- Geographic spread: Mentions in >3 countries
```

**Outputs**: Alert triggers, initial mention data, sentiment baseline

---

### 📦 Step 2: Crisis Analysis (Consumer Research Module)
**Objective**: Perform deep-dive analysis to understand crisis scope and impact

**Key Actions**:
- Create Quick Search dashboard for crisis topic
- Use AI Entity Search to identify key themes
- Segment audience reactions by demographics
- Identify influential voices driving the conversation
- Map geographic spread of the crisis

**Analysis Framework**:
1. **Scope Assessment**
   - Total mention volume
   - Rate of spread
   - Geographic distribution
   - Platform breakdown

2. **Sentiment Analysis**
   - Overall sentiment trend
   - Key negative drivers
   - Positive defenders
   - Neutral observers

3. **Influencer Mapping**
   - Crisis amplifiers
   - Brand advocates
   - Media coverage
   - Key opinion leaders

**Outputs**: Crisis insights dashboard, influencer list, sentiment analysis, key themes

---

### 📦 Step 3: Response Coordination (Engage Module)
**Objective**: Execute coordinated response strategy across all channels

**Key Actions**:
- Set up dedicated crisis response feeds
- Deploy pre-approved response templates
- Assign team members to specific channels
- Prioritize high-influence conversations
- Track response metrics in real-time

**Response Prioritization Matrix**:

| Influence Level | Sentiment | Response Priority | Response Type |
|----------------|-----------|------------------|---------------|
| High | Negative | Critical | Personal, Senior Team |
| High | Neutral | High | Detailed, Informative |
| Medium | Negative | High | Template + Personalization |
| Low | Negative | Medium | Standard Template |

**Best Practices**:
- Respond within 15 minutes for critical issues
- Use empathetic, solution-focused language
- Avoid defensive or argumentative responses
- Document all interactions for compliance
- Escalate legal/safety issues immediately

**Outputs**: Response metrics, interaction logs, escalation reports

---

### 📦 Step 4: Performance Tracking (Measure Module)
**Objective**: Monitor crisis recovery and response effectiveness

**Key Metrics to Track**:
- **Sentiment Recovery Rate**: Time to return to baseline sentiment
- **Response Effectiveness**: Engagement rate on crisis responses
- **Reach Metrics**: Total impressions of crisis responses
- **Share of Voice**: Brand mentions vs. crisis mentions
- **Platform Performance**: Response success by channel

**Dashboard Components**:
```
Crisis Recovery Dashboard:
├── Real-time Sentiment Gauge
├── Volume Trend Chart (24hr rolling)
├── Response Time Distribution
├── Platform Breakdown
├── Geographic Heat Map
└── Influencer Engagement Tracker
```

**Recovery Indicators**:
- ✅ Mention volume returning to normal
- ✅ Sentiment improving consistently
- ✅ Positive mentions increasing
- ✅ Media coverage becoming neutral/positive
- ✅ Influencer support growing

**Outputs**: Performance reports, recovery timeline, effectiveness metrics

---

### 📦 Step 5: Executive Reporting (VIZIA Module)
**Objective**: Provide real-time crisis visibility to stakeholders

**Dashboard Setup**:
- Create dedicated crisis command center display
- Configure auto-refresh (every 5 minutes)
- Set up mobile alerts for executives
- Include competitor crisis comparison
- Add predictive trend analysis

**Executive Dashboard Elements**:

| Component | Update Frequency | Key Insight |
|-----------|-----------------|-------------|
| Crisis Severity Score | Real-time | Overall threat level (1-10) |
| Sentiment Trend | 5 minutes | Direction and velocity |
| Response Metrics | 15 minutes | Team performance |
| Media Coverage | 30 minutes | Press sentiment |
| Recovery Timeline | Hourly | Estimated resolution |

**Communication Cadence**:
- **Hour 1**: Initial crisis brief
- **Hour 4**: Detailed impact assessment
- **Hour 12**: Response effectiveness review
- **Day 2**: Recovery progress update
- **Day 7**: Post-crisis analysis

**Outputs**: Executive dashboards, stakeholder reports, board presentations

---

## Workflow Triggers

### Automatic Triggers
- Mention volume spike >300% of rolling 7-day average
- Negative sentiment >70% for 2+ hours
- Trending negative hashtag mentioning brand
- Verified influencer negative mention (>100K followers)
- Media outlet negative coverage

### Manual Triggers
- Executive/legal team activation
- Customer service escalation
- Product recall announcement
- Data breach notification
- Regulatory action

---

## Success Metrics

### Immediate (0-4 hours)
- Time to crisis detection: <15 minutes
- Time to first response: <30 minutes
- Response coverage: >80% of critical mentions
- Team mobilization: 100% within 1 hour

### Short-term (4-24 hours)
- Sentiment stabilization achieved
- Media statement published
- Key stakeholders informed
- Response rate maintained >90%

### Long-term (1-7 days)
- Sentiment recovery to baseline
- Positive mention ratio improved
- Media coverage neutralized
- Customer trust metrics stable


---

## Integration Points

### Data Flow
```
Listen (Detection) → Consumer Research (Analysis)
    ↓                       ↓
Engage (Response) ← Insights & Priorities
    ↓
Measure (Tracking) → VIZIA (Reporting)
    ↓                    ↓
Feedback Loop → Process Improvement
```

### Key Handoffs
1. **Listen → Consumer Research**: Triggered alerts with initial data
2. **Consumer Research → Engage**: Priority response list with context
3. **Engage → Measure**: Response metrics and engagement data
4. **Measure → VIZIA**: Consolidated performance metrics
5. **All → Crisis Team**: Real-time updates via Slack/Teams

---

## Resources and Support

### Documentation
- [Listen: Setting Up Alerts Guide](../Listen/Email%20Alerts%20&%20Notifications/Set%20up%20Alerts.pdf)
- [Consumer Research: Quick Search Tutorial](../Consumer%20Research/Dashboards%20&%20Visualizations/Create%20a%20Dashboard%20from%20a%20Quick%20Search%20Result.pdf)
- [Engage: Crisis Response Templates](../Engage/Responding%20&%20Engaging/Using%20Templates%20for%20Responses.pdf)
- [Measure: Crisis Dashboard Setup](../Measure/Measure%20Dashboard%20Templates/Crisis%20Management%20Dashboard%20Template.pdf)
- [VIZIA: Executive Display Configuration](../VIZIA/Create%20Screens%20from%20Dashboards.pdf)


---
