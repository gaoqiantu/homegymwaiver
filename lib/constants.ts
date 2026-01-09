export const WAIVER_VERSION = '1.0'

// Helper function to generate waiver HTML for emails
export function generateWaiverHtml(): string {
  return WAIVER_SECTIONS.map(section => `
    <div style="margin-bottom: 20px;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #1a1a1a;">
        ${section.titleEn} / ${section.titleZh}
      </h3>
      <p style="margin: 0 0 6px 0; font-size: 12px; line-height: 1.6; color: #374151; white-space: pre-line;">
        ${section.contentEn}
      </p>
      <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #6b7280; white-space: pre-line;">
        ${section.contentZh}
      </p>
    </div>
  `).join('')
}

export const WAIVER_SECTIONS = [
  {
    titleEn: "1. Language Validity",
    titleZh: "1. 语言效力",
    contentEn: `This Agreement is written in both English and Chinese. In the event of any conflict or inconsistency between the English version and the Chinese version, the English version shall prevail.`,
    contentZh: `本协议以英文和中文书写。如中英文版本之间存在任何冲突或不一致，以英文版本为准。`,
  },
  {
    titleEn: "2. Assumption of Risk",
    titleZh: "2. 风险承担",
    contentEn: `I, the undersigned ("Participant"), understand that using the equipment and facilities at the Home Gym involves inherent risks, including but not limited to: muscle strains, tears, broken bones, heart attacks, stroke, permanent paralysis, or even death. I understand that this is a private residence, not a commercial facility, and there may be uneven surfaces, pets, or lack of immediate professional medical supervision.

I knowingly and freely assume all such risks, both known and unknown, even if arising from the negligence of the releasees or others, and assume full responsibility for my participation.`,
    contentZh: `我，即下述签名人（"参与者"），明白使用本家庭健身房的器材和设施涉及固有的风险，包括但不限于：肌肉拉伤、撕裂、骨折、心脏病发作、中风、永久性瘫痪甚至死亡。我明白这是一处私人住宅，而非商业设施，可能存在地面不平、宠物干扰或缺乏即时专业医疗监督的情况。

我知情并自愿承担所有此类已知和未知的风险，即使这些风险是由受免责方或其他人的疏忽引起的，并对我的参与承担全部责任。`,
  },
  {
    titleEn: "3. Release of Liability",
    titleZh: "3. 责任免除",
    contentEn: `I, for myself and on behalf of my heirs, assigns, personal representatives and next of kin, hereby release and hold harmless the Homeowner, their family members, and residents of the property ("Releasees") from any and all claims, demands, losses, and liability arising out of or related to any injury, disability, or death I may suffer, or loss or damage to person or property, whether arising from the negligence of the releasees or otherwise, to the fullest extent permitted by law.`,
    contentZh: `我代表我自己、我的继承人、受让人、个人代表和近亲，特此免除房主、其家庭成员及该物业的居住者（"受免责方"）的责任，并承诺不因我可能遭受的任何伤害、残疾或死亡，或人身或财产的损失或损坏（无论是否源于受免责方的疏忽或其他原因）而向其提出索赔、要求、诉讼，并在法律允许的最大范围内免除其赔偿责任。`,
  },
  {
    titleEn: "4. Health Warranty",
    titleZh: "4. 健康声明",
    contentEn: `I represent that I am in good physical condition and have no medical reason or impairment that might prevent me from intended participation in exercise activities. I acknowledge that the Homeowner has advised me to consult a physician before starting any exercise program.`,
    contentZh: `我声明我的身体状况良好，没有任何可能妨碍我参与预期锻炼活动的医疗原因或障碍。我确认房主已建议我在开始任何锻炼计划前咨询医生。`,
  },
  {
    titleEn: "5. House Rules & Conduct",
    titleZh: "5. 场地规则与行为准则",
    contentEn: `I understand that this gym is located within a private home. I agree to:
a) Limit my activity strictly to the designated gym area.
b) Respect the privacy of the residents and strictly NOT enter private living areas (kitchen, bedrooms, etc.) without explicit invitation.
c) Treat all equipment with care and return weights to their racks after use.
d) Assume responsibility for any damage to the property caused by my negligence or misuse.`,
    contentZh: `我明白该健身房位于私人住宅内。我同意：
a) 严格将我的活动限制在指定的健身区域内。
b) 尊重居住者的隐私，在未获明确邀请的情况下，严禁进入私人生活区域（如厨房、卧室等）。
c) 爱护所有器材，并在使用后将重物归位。
d) 对因我的疏忽或不当使用造成的任何财产损坏承担责任。`,
  },
  {
    titleEn: "6. Medical Emergency",
    titleZh: "6. 紧急医疗授权",
    contentEn: `In the event of a medical emergency, I authorize the Homeowner or their agents to secure emergency medical care or transportation for me. I agree to pay all costs associated with such care and transportation.`,
    contentZh: `如发生医疗紧急情况，我授权房主或其代理人为我寻求紧急医疗护理或转运。我同意支付与此类护理和转运相关的所有费用。`,
  },
]
