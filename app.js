// 検索・AI回答 改善ダッシュボード（デモ）2026-10-12
// 画面は5つ（全体の流れ／検索キーワード／AI の回答／施策と効果／次の改善の提案）。#overview などで切り替える。
// ?nologin=1 を付けて開くとログイン画面を飛ばす（画面写真を撮るとき用）。
(function () {
  var D = window.DEMO;
  var app = document.getElementById("app");
  var TABS = [
    ["overview", "全体の流れ"],
    ["keywords", "検索キーワード"],
    ["ai", "AI の回答"],
    ["measures", "施策と効果"],
    ["proposals", "次の改善の提案"]
  ];
  var aiView = "after";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(n) { return Number(n).toLocaleString("ja-JP"); }
  function chg(a, b) {
    var p = Math.round((b - a) / a * 100);
    return '<span class="' + (p >= 0 ? "up" : "down") + '">' + (p >= 0 ? "＋" : "−") + Math.abs(p) + "%</span>";
  }
  function rate(n, d) { return (n / d * 100); }
  function get(key) { for (var i = 0; i < D.funnel.length; i++) if (D.funnel[i].key === key) return D.funnel[i]; }

  function authed() { try { return sessionStorage.getItem("msd-auth") === "1"; } catch (e) { return false; } }
  function setAuthed() { try { sessionStorage.setItem("msd-auth", "1"); } catch (e) {} }

  // ---------- ログイン ----------
  function viewLogin() {
    app.innerHTML =
      '<div class="login"><form class="login-card" id="loginForm">' +
      '<span class="badge">デモ・架空のデータ</span>' +
      "<h1>検索・AI回答 改善ダッシュボード</h1>" +
      '<p class="sub">' + esc(D.company) + "（架空）様　" + esc(D.site) + "</p>" +
      '<div class="field"><label for="uid">ID</label><input id="uid" value="demo@example.com" readonly></div>' +
      '<div class="field"><label for="pw">パスワード</label><input id="pw" type="password" value="demo1234" readonly></div>' +
      '<button class="btn" type="submit">ログイン</button>' +
      '<p class="login-note">デモ用の ID とパスワードは入力済みです。このデモの会社・製品・数字はすべて架空です。</p>' +
      "</form></div>";
    document.getElementById("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      setAuthed();
      if (!location.hash) location.hash = "#overview";
      render();
    });
  }

  // ---------- 共通の枠 ----------
  function header(tab) {
    var tabs = TABS.map(function (t) {
      return '<button class="tab' + (t[0] === tab ? " on" : "") + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
    }).join("");
    return '<header class="topbar"><div class="topbar-in">' +
      '<div class="brand"><h1>検索・AI回答 改善ダッシュボード</h1><span class="badge">デモ・架空のデータ</span></div>' +
      '<p class="brand-sub">' + esc(D.company) + "（架空）　" + esc(D.site) + "　｜　製品：" + esc(D.products) + "</p>" +
      '<nav class="tabs">' + tabs + "</nav></div></header>";
  }
  function periodLine() {
    return '<p class="period"><span><span class="legend-dot" style="background:var(--before)"></span>施策の前　<b>' +
      esc(D.periods.before) + '</b></span><span><span class="legend-dot" style="background:var(--teal)"></span>施策の後　<b>' +
      esc(D.periods.after) + "</b></span><span>（各6か月の合計）</span></p>";
  }
  function footer() {
    return "<footer>このデモの会社・製品・数字はすべて架空です。実際のご支援では、御社の検索・アクセス解析・営業管理のデータをつないで、同じ画面をつくります。<br>" +
      "作成：Terveys Technology Solutions 日本支店（2026年10月）</footer>";
  }

  // ---------- 全体の流れ ----------
  function viewOverview() {
    var hcp = get("hcp"), inq = get("inq"), deal = get("deal"), won = get("won"), sales = get("sales");
    function kpi(item, label) {
      return '<div class="kpi"><div class="k">' + esc(label || item.label) + '</div><div class="v num">' + fmt(item.after) +
        "<small>" + esc(item.unit) + '</small></div><div class="d">' + chg(item.before, item.after) +
        ' <span class="was">施策の前 ' + fmt(item.before) + esc(item.unit) + "</span></div></div>";
    }
    var rows = D.funnel.map(function (f) {
      var mx = Math.max(f.before, f.after);
      return '<div class="flow-row"><div class="flow-name">' + esc(f.label) + (f.note ? "<small>" + esc(f.note) + "</small>" : "") + "</div>" +
        '<div class="bars">' +
        '<div class="barline"><div class="track"><div class="bar b" style="width:' + (f.before / mx * 100).toFixed(1) + '%"></div></div><span class="bar-val num">' + fmt(f.before) + esc(f.unit) + "</span></div>" +
        '<div class="barline"><div class="track"><div class="bar a" style="width:' + (f.after / mx * 100).toFixed(1) + '%"></div></div><span class="bar-val num">' + fmt(f.after) + esc(f.unit) + "</span></div>" +
        "</div>" +
        '<div class="flow-chg">' + chg(f.before, f.after) + "</div></div>";
    }).join("");
    var r1 = [rate(inq.before, hcp.before), rate(inq.after, hcp.after)];
    var r2 = [rate(deal.before, inq.before), rate(deal.after, inq.after)];
    var r3 = [rate(won.before, deal.before), rate(won.after, deal.after)];
    var src = D.sources.map(function (s) { return "<dt>" + esc(s[0]) + "</dt><dd>" + esc(s[1]) + "</dd>"; }).join("");
    return '<p class="lead">検索や AI の回答で御社のサイトがどう見えているかから、問い合わせ・商談・受注までを、施策の前と後の6か月で比べます。</p>' +
      periodLine() +
      '<div class="kpis">' + kpi(hcp, "医療従事者の訪問") + kpi(inq) + kpi(deal, "商談") + kpi(sales) + "</div>" +
      '<section class="card"><h2>検索から受注までの流れ</h2>' +
      '<p class="hint">上の段が施策の前、下の段が施策の後です。棒の長さは、段ごとに大きい方を100%にしています。</p>' +
      rows +
      '<p class="rate-line num">問い合わせになる率（医療従事者の訪問に対して） ' + r1[0].toFixed(2) + "% → <b>" + r1[1].toFixed(2) + "%</b>　／　商談になる率 " +
      Math.round(r2[0]) + "% → <b>" + Math.round(r2[1]) + "%</b>　／　受注になる率 " + Math.round(r3[0]) + "% → <b>" + Math.round(r3[1]) + "%</b></p></section>" +
      '<section class="card"><h2>月ごとの推移</h2>' +
      '<p class="hint">棒＝医療従事者の訪問（左の目盛り）、線＝問い合わせ（右の目盛り）。4月から施策を始めました。</p>' +
      '<div id="monthChart"></div></section>' +
      '<section class="card"><h2>数字の出どころ</h2><p class="hint">実際のご支援では、次のデータから同じ数字を毎月出します。</p><dl class="sources">' + src + "</dl></section>";
  }

  function drawMonthChart() {
    var box = document.getElementById("monthChart");
    if (!box) return;
    var W = Math.max(300, Math.min(1080, box.clientWidth)), H = W < 500 ? 230 : 270;
    var m = { l: 40, r: 34, t: 26, b: 30 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var n = D.months.length, slot = iw / n, bw = Math.max(8, slot * 0.58);
    var vMax = 2400, qMax = 40;
    var fs = W < 500 ? 10 : 11;
    var s = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="月ごとの医療従事者の訪問と問い合わせ">';
    for (var g = 0; g <= 4; g++) {
      var y = m.t + ih - ih * g / 4;
      s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y + '" y2="' + y + '" stroke="#e6ebf0"/>';
      s += '<text x="' + (m.l - 6) + '" y="' + (y + 4) + '" font-size="' + fs + '" fill="#5d6d7e" text-anchor="end">' + fmt(vMax * g / 4) + "</text>";
      s += '<text x="' + (W - m.r + 6) + '" y="' + (y + 4) + '" font-size="' + fs + '" fill="#14365d">' + Math.round(qMax * g / 4) + "</text>";
    }
    var xs = [];
    for (var i = 0; i < n; i++) {
      var cx = m.l + slot * i + slot / 2;
      xs.push(cx);
      var h = ih * D.hcpVisits[i] / vMax;
      s += '<rect x="' + (cx - bw / 2) + '" y="' + (m.t + ih - h) + '" width="' + bw + '" height="' + h + '" rx="2" fill="' +
        (i >= D.measureStartIndex ? "#0f7c76" : "#b4c0cc") + '"><title>' + D.months[i] + "　医療従事者の訪問 " + fmt(D.hcpVisits[i]) + "件</title></rect>";
      s += '<text x="' + cx + '" y="' + (H - 10) + '" font-size="' + fs + '" fill="#5d6d7e" text-anchor="middle">' + D.months[i] + "</text>";
    }
    var pts = D.inquiries.map(function (v, k) { return xs[k] + "," + (m.t + ih - ih * v / qMax); }).join(" ");
    s += '<polyline points="' + pts + '" fill="none" stroke="#14365d" stroke-width="2.2"/>';
    D.inquiries.forEach(function (v, k) {
      s += '<circle cx="' + xs[k] + '" cy="' + (m.t + ih - ih * v / qMax) + '" r="3.2" fill="#fff" stroke="#14365d" stroke-width="2"><title>' +
        D.months[k] + "　問い合わせ " + v + "件</title></circle>";
    });
    var mx = m.l + slot * D.measureStartIndex;
    s += '<line x1="' + mx + '" x2="' + mx + '" y1="' + (m.t - 8) + '" y2="' + (m.t + ih) + '" stroke="#b03a2e" stroke-dasharray="4 3"/>';
    s += '<text x="' + (mx + 5) + '" y="' + (m.t - 10) + '" font-size="' + fs + '" fill="#b03a2e">施策を開始</text>';
    s += '<text x="' + (m.l - 6) + '" y="' + (m.t - 10) + '" font-size="' + fs + '" fill="#5d6d7e" text-anchor="end">件</text>';
    s += "</svg>";
    box.innerHTML = s;
  }

  // ---------- 検索キーワード ----------
  function rankTxt(r) { return r == null ? "100位外" : r + "位"; }
  function viewKeywords() {
    var sumB = 0, sumA = 0, sumQ = 0;
    var rows = D.keywords.map(function (k) {
      sumB += k.clicks[0]; sumA += k.clicks[1]; sumQ += k.inq;
      return '<tr><td><div class="kw">' + esc(k.kw) + '</div><div class="who">主に検索する人：' + esc(k.who) + "</div></td>" +
        '<td class="r num">' + rankTxt(k.rank[0]) + '<span class="arrow">→</span><b>' + rankTxt(k.rank[1]) + "</b></td>" +
        '<td class="r num">' + fmt(k.clicks[0]) + '<span class="arrow">→</span><b>' + fmt(k.clicks[1]) + "</b></td>" +
        '<td class="r num">' + k.inq + "件</td></tr>";
    }).join("");
    var inq = get("inq");
    return '<p class="lead">医療従事者が実際に使っている検索語のうち、問い合わせにつながった上位10語です。順位は Google の検索結果での位置、クリックは1か月の平均です。</p>' +
      periodLine() +
      '<section class="card"><h2>検索語ごとの順位・クリック・問い合わせ</h2>' +
      '<p class="hint">問い合わせは、施策の後の6か月で、その検索語から来た訪問が起点になった件数です。</p>' +
      '<div class="tablewrap"><table><thead><tr><th>検索語</th><th class="r">順位（前 → 後）</th><th class="r">月のクリック（前 → 後）</th><th class="r">問い合わせ</th></tr></thead><tbody>' +
      rows +
      '<tr><td><b>上位10語の合計</b></td><td></td><td class="r num">' + fmt(sumB) + '<span class="arrow">→</span><b>' + fmt(sumA) + '</b></td><td class="r num"><b>' + sumQ + "件</b></td></tr>" +
      "</tbody></table></div>" +
      '<p class="rate-line">施策の後の問い合わせ ' + inq.after + "件のうち " + sumQ + "件（" + Math.round(sumQ / inq.after * 100) +
      "%）が、この10語から来た訪問が起点です。「選び方」「比較」「止血デバイス」を含む語の伸びが大きくなっています。</p></section>";
  }

  // ---------- AI の回答 ----------
  var CHIP = { c: ["c", "出典"], m: ["m", "名前のみ"], n: ["n", "なし"] };
  function viewAI() {
    var v = aiView, total = D.aiQuestions.length * D.aiServices.length, cites = 0, ments = 0, citesB = 0;
    D.aiQuestions.forEach(function (q) {
      q[v].split("").forEach(function (x) { if (x === "c") cites++; if (x === "m") ments++; });
      q.before.split("").forEach(function (x) { if (x === "c") citesB++; });
    });
    var head = D.aiServices.map(function (s) { return '<th class="svc">' + esc(s) + "</th>"; }).join("");
    var rows = D.aiQuestions.map(function (q) {
      return '<tr><td class="ai-q">' + esc(q.q) + "</td>" + q[v].split("").map(function (x) {
        return '<td class="c"><span class="chip ' + CHIP[x][0] + '">' + CHIP[x][1] + "</span></td>";
      }).join("") + "</tr>";
    }).join("");
    return '<p class="lead">医療従事者が AI に聞きそうな8つの質問を、毎月4つの AI サービスに入力し、回答に御社のページが出てくるかを記録しています。</p>' +
      '<div class="seg"><button data-ai="before" class="' + (v === "before" ? "on" : "") + '">施策の前（' + esc(D.aiMonths.before) + '）</button>' +
      '<button data-ai="after" class="' + (v === "after" ? "on" : "") + '">施策の後（' + esc(D.aiMonths.after) + "）</button></div>" +
      '<section class="card"><h2>質問ごとの結果（' + esc(D.aiMonths[v]) + "）</h2>" +
      '<div class="ai-sum num"><span>出典として示された <b>' + cites + "</b> / " + total + "（" + Math.round(cites / total * 100) + "%）</span>" +
      "<span>名前だけ出た <b>" + ments + "</b> / " + total + "</span>" +
      (v === "after" ? '<span>施策の前は出典 ' + citesB + " / " + total + "</span>" : "") + "</div>" +
      '<div class="tablewrap ai-table"><table><thead><tr><th>質問</th>' + head + "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
      '<div class="ai-list">' + D.aiQuestions.map(function (q) {
        return '<div class="ai-item"><p class="ai-iq">' + esc(q.q) + '</p><div class="ai-grid">' + q[v].split("").map(function (x, k) {
          return '<div class="ai-cell"><span class="ai-svc">' + esc(D.aiServicesShort[k]) + '</span><span class="chip ' + CHIP[x][0] + '">' + CHIP[x][1] + "</span></div>";
        }).join("") + "</div></div>";
      }).join("") + "</div>" +
      '<p class="rate-line"><span class="chip c">出典</span> 回答の根拠として御社のページへのリンクが示された　' +
      '<span class="chip m">名前のみ</span> 社名・製品名は出たがリンクはない　<span class="chip n">なし</span> 出てこない</p></section>';
  }

  // ---------- 施策と効果 ----------
  function viewMeasures() {
    var items = D.measures.map(function (x) {
      return '<li><div class="tl-when">' + esc(x.when) + '</div><p class="tl-title">' + esc(x.title) + '</p><p class="tl-what">' + esc(x.what) + "</p>" +
        '<ul class="tl-eff">' + x.effect.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul></li>";
    }).join("");
    return '<p class="lead">実施した施策と、その後に数字がどう変わったかです。最初に「測る仕組み」をつくり、施策ごとの効果を売上まで追えるようにしました。</p>' +
      '<section class="card"><ul class="timeline">' + items + "</ul></section>";
  }

  // ---------- 次の改善の提案 ----------
  function viewProposals() {
    var cards = D.proposals.map(function (p) {
      return '<div class="prop p-' + p.pri + '"><div class="pri">優先度 ' + esc(p.pri) + "</div><h3>" + esc(p.title) + "</h3><dl>" +
        "<dt>理由</dt><dd>" + esc(p.why) + "</dd><dt>作業</dt><dd>" + esc(p.work) + "</dd><dt>見込む効果</dt><dd>" + esc(p.expect) + "</dd></dl></div>";
    }).join("");
    return '<p class="lead">ここまでの数字から、次に効果が見込める順に並べた改善の案です。毎月の報告で、実施したものの効果を確かめます。</p>' +
      '<div class="props">' + cards + "</div>";
  }

  // ---------- 切り替え ----------
  function currentTab() {
    var t = (location.hash || "#overview").slice(1);
    for (var i = 0; i < TABS.length; i++) if (TABS[i][0] === t) return t;
    return "overview";
  }
  function render() {
    if (/[?&]nologin=1(&|$)/.test(location.search)) setAuthed();
    if (!authed()) return viewLogin();
    var tab = currentTab();
    var body = tab === "keywords" ? viewKeywords() : tab === "ai" ? viewAI() : tab === "measures" ? viewMeasures() :
      tab === "proposals" ? viewProposals() : viewOverview();
    app.innerHTML = header(tab) + "<main>" + body + "</main>" + footer();
    if (tab === "overview") drawMonthChart();
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (b) {
      b.addEventListener("click", function () { location.hash = "#" + b.getAttribute("data-tab"); });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-ai]"), function (b) {
      b.addEventListener("click", function () { aiView = b.getAttribute("data-ai"); render(); });
    });
  }
  var rt;
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(drawMonthChart, 150); });
  render();
})();
