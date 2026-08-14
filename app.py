import streamlit as st
import pandas as pd
import plotly.express as px

st.set_page_config(page_title="Gestão de Projetos CEI-MCR", layout="wide")

@st.cache_data
def load_data():
    acoes = pd.read_csv("public/ACOES.csv")
    atividades = pd.read_csv("public/ATIVIDADES.csv")
    subatividades = pd.read_csv("public/SUBATIVIDADES.csv")
    return acoes, atividades, subatividades

acoes, atividades, subatividades = load_data()

st.title("Gestão de Projetos CEI-MCR")

# Sidebar Filters
st.sidebar.header("Filtros")

# Format columns
if 'Pilar' in acoes.columns:
    pilares = acoes['Pilar'].dropna().unique().tolist()
    selected_pilares = st.sidebar.multiselect("Pilar", pilares, pilares)
else:
    selected_pilares = []

if 'Responsavel' in atividades.columns:
    responsaveis = atividades['Responsavel'].dropna().unique().tolist()
    selected_responsaveis = st.sidebar.multiselect("Responsável (Atividades)", responsaveis, responsaveis)
else:
    selected_responsaveis = []

if 'Status' in atividades.columns:
    status_list = atividades['Status'].dropna().unique().tolist()
    selected_status = st.sidebar.multiselect("Status (Atividades)", status_list, status_list)
else:
    selected_status = []

# Filtering
filtered_acoes = acoes[acoes['Pilar'].isin(selected_pilares)] if selected_pilares else acoes
filtered_acoes_ids = filtered_acoes['IDAcao'].tolist() if 'IDAcao' in filtered_acoes.columns else []

filtered_atividades = atividades[
    (atividades['Acoes'].isin(filtered_acoes_ids)) &
    (atividades['Responsavel'].isin(selected_responsaveis)) &
    (atividades['Status'].isin(selected_status))
] if not atividades.empty else atividades

filtered_ativ_ids = filtered_atividades['IDAtividade'].tolist() if 'IDAtividade' in filtered_atividades.columns else []

filtered_sub = subatividades[subatividades['IDAtividade'].isin(filtered_ativ_ids)] if not subatividades.empty else subatividades


# 1. DASHBOARD DE GESTÃO
st.header("Dashboard de Gestão")
col1, col2, col3 = st.columns(3)
col1.metric("Total de Ações", len(filtered_acoes))
col2.metric("Total de Atividades", len(filtered_atividades))
col3.metric("Total de Subatividades", len(filtered_sub))

if not filtered_atividades.empty:
    st.subheader("Gráficos")
    c1, c2 = st.columns(2)
    
    with c1:
        # Atividades por Status
        fig_status = px.pie(filtered_atividades, names='Status', title="Atividades por Status")
        st.plotly_chart(fig_status, use_container_width=True)
    
    with c2:
        # Atividades por Responsável
        fig_resp = px.histogram(filtered_atividades, x='Responsavel', color='Status', title="Atividades por Responsável")
        st.plotly_chart(fig_resp, use_container_width=True)

# 2. VISÃO HIERÁRQUICA E DETALHES
st.header("Visão Hierárquica")

if not filtered_acoes.empty:
    acao_nomes = filtered_acoes['NomeAcao'].dropna().tolist()
    selected_acao_nome = st.selectbox("Selecione uma Ação", acao_nomes)
    
    if selected_acao_nome:
        acao_row = filtered_acoes[filtered_acoes['NomeAcao'] == selected_acao_nome].iloc[0]
        st.write("**Pilar:**", acao_row.get('Pilar', ''))
        st.write("**Meta Finep:**", acao_row.get('MetaFinep', ''))
        st.write("**Rubrica Orçamentária:**", acao_row.get('RubricaOrcamentaria', ''))
        st.write("**Valor Estimado:**", acao_row.get('ValorEstimado', ''))
        
        acao_id = acao_row.get('IDAcao')
        ativs_da_acao = filtered_atividades[filtered_atividades['Acoes'] == acao_id]
        
        if not ativs_da_acao.empty:
            ativ_nomes = ativs_da_acao['Atividade'].dropna().tolist()
            selected_ativ_nome = st.selectbox("Selecione uma Atividade", ativ_nomes)
            
            if selected_ativ_nome:
                ativ_row = ativs_da_acao[ativs_da_acao['Atividade'] == selected_ativ_nome].iloc[0]
                st.write("**Status:**", ativ_row.get('Status', ''))
                st.write("**Responsável:**", ativ_row.get('Responsavel', ''))
                st.write("**Datas:**", ativ_row.get('DataInicio', ''), "-", ativ_row.get('DataFim', ''))
                st.write("**Descrição:**", ativ_row.get('Descricao', ''))
                st.write("**Indicador Físico:**", ativ_row.get('IndicadorFisico', ''))
                st.write("**Observação:**", ativ_row.get('Observacao', ''))
                if pd.notna(ativ_row.get('LinkEvidencia')):
                    st.write("**Link de Evidência:**", f"[Link]({ativ_row.get('LinkEvidencia')})")
                
                ativ_id = ativ_row.get('IDAtividade')
                subs_da_ativ = filtered_sub[filtered_sub['IDAtividade'] == ativ_id]
                
                if not subs_da_ativ.empty:
                    st.subheader("Subatividades")
                    st.dataframe(subs_da_ativ[['Subatividade', 'Descricao', 'Status', 'Responsavel', 'DataInicio', 'DataFim']])
                else:
                    st.info("Nenhuma subatividade encontrada para esta atividade.")
        else:
            st.info("Nenhuma atividade encontrada para esta ação.")
else:
    st.info("Nenhuma ação encontrada com os filtros atuais.")
