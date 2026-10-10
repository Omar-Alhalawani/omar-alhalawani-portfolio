"""Verify live routes, staging metadata, and assets against the production build."""
import concurrent.futures
import datetime
import hashlib
import html
import json
import os
import pathlib
import re
import urllib.error
import urllib.request

base = os.environ["QA_BASE_URL"].rstrip("/")
output = pathlib.Path(os.environ.get("QA_OUTPUT", "qa-artifacts"))
output.mkdir(parents=True, exist_ok=True)
routes = ["/", "/experience", "/projects", "/projects/fifo", "/projects/fpga-arithmetic",
          "/projects/emg", "/projects/lumalink", "/projects/cubex", "/projects/mini-lysimeter",
          "/about", "/resume", "/contact", "/missing-signal"]
result = {"date": datetime.datetime.now(datetime.timezone.utc).isoformat(), "base": base,
          "applicationCommit": os.environ.get("QA_SOURCE_COMMIT"),
          "tlsVerification": True, "routes": [], "assets": [], "errors": []}


def fetch(route):
    try:
        response = urllib.request.urlopen(base + route, timeout=25)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        return route, response.status, response.url, dict(response.headers.items()), response.read()


try:
    assets = set()
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        documents = list(pool.map(fetch, routes))
    for route, status, url, headers, data in documents:
        markup = data.decode()
        headers = {key.lower(): value for key, value in headers.items()}
        assert status == (404 if route == "/missing-signal" else 200), (route, status)
        assert url.startswith(base), (route, url)
        assert "noindex" in headers.get("x-robots-tag", ""), route
        assert re.search(r'<meta[^>]+name="robots"[^>]+noindex', markup), route
        canonical = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]+)"', markup).group(1)
        image = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', markup).group(1)
        expected_path = "/404" if route == "/missing-signal" else route
        assert canonical == base + expected_path, (route, canonical)
        assert image == base + "/og.png", (route, image)
        for ref in re.findall(r'(?:href|src|component-url|renderer-url)="(/[^"]*)"', markup):
            ref = html.unescape(ref).split("#")[0].split("?")[0]
            if pathlib.PurePosixPath(ref).suffix:
                assets.add(ref)
        result["routes"].append({"route": route, "status": status, "canonical": canonical,
                                 "ogImage": image, "xRobotsTag": headers["x-robots-tag"], "bytes": len(data)})
    assets.update(["/robots.txt", "/sitemap.xml", "/og.png", "/resume/Omar_Alhalawani_ASIC_Resume.pdf"])
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        responses = list(pool.map(fetch, sorted(assets)))
    for route, status, url, headers, data in responses:
        headers = {key.lower(): value for key, value in headers.items()}
        assert status == 200 and url.startswith(base), (route, status, url)
        local = pathlib.Path("dist" + route)
        assert local.is_file() and data == local.read_bytes(), route
        digest = hashlib.sha256(data).hexdigest()
        if route == "/robots.txt":
            assert b"Disallow: /" in data
        if route.endswith(".pdf"):
            assert digest == "d08af79e099aee625ded17228042a7df109f1c6a919c3f9dc35acd5722d5a7f6"
        if route == "/sitemap.xml":
            assert data.count(b"<loc>") == 12 and base.encode() in data
        result["assets"].append({"path": route, "status": status, "bytes": len(data), "sha256": digest,
                                 "matchesLocalBuild": True, "cacheControl": headers.get("cache-control")})
except Exception as error:
    result["errors"].append(str(error))
    raise
finally:
    (output / "delivery-results.json").write_text(json.dumps(result, indent=2))
    print(json.dumps({"routes": len(result["routes"]), "assetResponses": len(result["assets"]),
                      "allPassed": not result["errors"], "metadataOrigin": base}))
