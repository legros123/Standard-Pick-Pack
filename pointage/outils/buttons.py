PDJ = "Point Du Jour"
BUTTONS = [
    dict(sheet=PDJ, name="btn_pp", text="PP", macro="REMPLIR_PP", range="D9", color="2F6FED"),
    dict(sheet=PDJ, name="btn_hg", text="HG", macro="REMPLIR_HG", range="E9", color="7C3AED"),
    dict(sheet=PDJ, name="btn_ca", text="CÂBLE", macro="REMPLIR_CABLE", range="F9", color="0D9488"),
    dict(sheet=PDJ, name="btn_tout", text="TOUT", macro="REMPLIR_TOUT", range="G9", color="13294B"),
    dict(sheet=PDJ, name="btn_actualiser", text="1 · ACTUALISER LOGYS", macro="ACTUALISER", range="H9:I9", color="1D4ED8"),
    dict(sheet=PDJ, name="btn_apercu", text="APERÇU DU MAIL", macro="APERCU", range="J9:K9", color="475569"),
    dict(sheet=PDJ, name="btn_mail", text="2 · PRÉPARER LE MAIL", macro="MAIL", range="L9:M9", color="15803D"),
    dict(sheet=PDJ, name="btn_nouveau", text="NOUVEAU JOUR · vider les saisies", macro="NOUVEAU_JOUR", range="O42:R42", color="B45309"),
    dict(sheet=PDJ, name="btn_cadre", text="COPIER LE CADRE", macro="COPIER_CADRE", range="O44:P44", color="64748B"),
    dict(sheet=PDJ, name="btn_diag", text="DIAGNOSTIC", macro="DIAGNOSTIC", range="Q44:R44", color="64748B"),
]
for m in ("OCT", "NOV", "DEC"):
    BUTTONS += [
        dict(sheet=m, name="btn_pp", text="REMPLIR 7,4 h", macro="REMPLIR_PP", range="B7:D7", color="1E40AF"),
        dict(sheet=m, name="btn_hg", text="REMPLIR 7,4 h", macro="REMPLIR_HG", range="B43:D43", color="5B21B6"),
        dict(sheet=m, name="btn_ca", text="REMPLIR 7,4 h", macro="REMPLIR_CABLE", range="B69:D69", color="0F766E"),
    ]
