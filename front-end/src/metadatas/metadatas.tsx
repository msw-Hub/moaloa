import { Helmet } from "react-helmet-async";

export function DefaultMetas(): JSX.Element {
  return (
    <Helmet>
      <title>모아로아 MoaLoa - 로스트아크 도구 모음</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="keywords" content="moaloa, 모아로아, 로스트아크, 보석시세, 영지제작, 경매" />
      <meta name="description" content="로스트아크의 도구 모음사이트 Moaloa입니다. 보석 검색, 영지 제작, 경매 계산 기능을 제공합니다." />
      <meta name="author" content="Moaloa" />
      <meta name="robots" content="index,follow" />
      <meta property="og:url" content="https://moaloa.org" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="모아로아 MoaLoa - 로스트아크 도구 모음" />
      <meta property="og:description" content="로스트아크의 도구 모음사이트 모아로아 Moaloa입니다. 보석 검색, 영지 제작, 경매 계산 기능을 제공합니다." />
    </Helmet>
  );
}
export function GemSearchMetas(): JSX.Element {
  return (
    <Helmet>
      <title>보석검색 - 모아로아 MoaLoa</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="keywords" content="moaloa, 모아로아, 로스트아크, 보석시세, 영지제작, 경매" />
      <meta name="description" content="보석을 판매할때 각 보석별 최저가를 알려주는 기능을 제공합니다." />
      <meta name="author" content="Moaloa" />
      <meta name="robots" content="index,follow" />
      <meta property="og:url" content="https://moaloa.org/gemsearch" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="보석검색 - 모아로아 MoaLoa" />
      <meta property="og:description" content="보석을 판매할때 각 보석별 최저가를 알려주는 기능을 제공합니다." />
    </Helmet>
  );
}

export function CraftMetas(): JSX.Element {
  return (
    <Helmet>
      <title>영지제작 - 모아로아 MoaLoa</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="keywords" content="moaloa, 모아로아, 로스트아크, 보석시세, 영지제작, 경매" />
      <meta name="description" content="실시간으로 각 제작법의 최적의 제작비용을 계산하여 알려주는 기능을 제공합니다." />
      <meta name="author" content="Moaloa" />
      <meta name="robots" content="index,follow" />
      <meta property="og:url" content="https://moaloa.org/craft" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="영지제작 - 모아로아 MoaLoa" />
      <meta property="og:description" content="실시간으로 각 제작법의 최적의 제작비용을 계산하여 알려주는 기능을 제공합니다." />
    </Helmet>
  );
}
export function MaterialMetas(): JSX.Element {
  return (
    <Helmet>
      <title>생활재료판매 - 모아로아 MoaLoa</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="keywords" content="moaloa, 모아로아, 로스트아크, 보석시세, 영지제작, 경매" />
      <meta name="description" content="생활재료를 판매할때 각 재료별 최저가를 알려주는 기능을 제공합니다." />
      <meta name="author" content="Moaloa" />
      <meta name="robots" content="index,follow" />
      <meta property="og:url" content="https://moaloa.org/material" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="생활재료판매 - 모아로아 MoaLoa" />
      <meta property="og:description" content="생활재료를 판매할때 각 재료별 최저가를 알려주는 기능을 제공합니다." />
    </Helmet>
  );
}

export function AuctionMetas(): JSX.Element {
  return (
    <Helmet>
      <title>경매계산 - 모아로아 MoaLoa</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="keywords" content="moaloa, 모아로아, 로스트아크, 보석시세, 영지제작, 경매" />
      <meta name="description" content="경매 입찰시 적정 입찰비용을 알려주는 기능을 제공합니다." />
      <meta name="author" content="Moaloa" />
      <meta name="robots" content="index,follow" />
      <meta property="og:url" content="https://moaloa.org/auction" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="경매계산 - 모아로아 MoaLoa" />
      <meta property="og:description" content="경매 입찰시 적정 입찰비용을 알려주는 기능을 제공합니다." />
    </Helmet>
  );
}
