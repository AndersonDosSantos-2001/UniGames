import './styles.css';

export default function TabelaJogos({
  jogos,
  carregandoLista,
  editandoId,
  onEditar,
  onDeletar,
}) {
  return (
    <section className="panel-box">
      <div className="panel-header">
        <div>
          <h2>
            <span className="material-icons panel-title-icon">view_list</span>
            JOGOS CADASTRADOS ({jogos.length})
          </h2>
          <p>
            Visualize os jogos em linha e utilize os botões de ação para alterar ou apagar.
          </p>
        </div>
      </div>

      {carregandoLista ? (
        <div className="table-empty">Carregando jogos cadastrados...</div>
      ) : jogos.length === 0 ? (
        <div className="table-empty">
          Nenhum jogo cadastrado ainda. Utilize o formulário acima para cadastrar o primeiro!
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="inline-table">
            <thead>
              <tr>
                <th className="col-capa">Capa</th>
                <th className="col-nome">Nome</th>
                <th className="col-dev">Desenvolvedora</th>
                <th className="col-preco">Preço</th>
                <th className="col-acoes">Ações</th>
              </tr>
            </thead>
            <tbody>
              {jogos.map((jogo) => (
                <tr
                  key={jogo.id}
                  className={editandoId === jogo.id ? 'editing-row' : ''}
                >
                  <td className="col-capa">
                    <div className="table-thumb">
                      {jogo.imagem ? (
                        <img src={jogo.imagem} alt={jogo.nome} />
                      ) : (
                        <span className="material-icons thumb-placeholder-icon">
                          image
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="col-nome">
                    <strong>{jogo.nome}</strong>
                    <span className="row-subtext">
                      {jogo.ano_lancamento} •{' '}
                      {jogo.generos?.map((g) => g.nome).join(', ') || 'Sem gênero'}
                    </span>
                  </td>
                  <td className="col-dev">
                    {jogo.desenvolvedora?.nome || '—'}
                  </td>
                  <td className="col-preco">
                    R$ {Number(jogo.preco).toFixed(2).replace('.', ',')}
                  </td>
                  <td className="col-acoes">
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-action-icon edit"
                        title="Alterar Jogo"
                        onClick={() => onEditar(jogo)}
                      >
                        <span className="material-icons">edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn-action-icon delete"
                        title="Apagar Jogo"
                        onClick={() => onDeletar(jogo)}
                      >
                        <span className="material-icons">delete_outline</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}