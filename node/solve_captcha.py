import sys
from amazoncaptcha import AmazonCaptcha

def solve_captcha(captcha_url):
    captcha_solver = AmazonCaptcha.fromlink(captcha_url)
    captcha_solution = captcha_solver.solve()
    return captcha_solution

if __name__ == "__main__":
    captcha_url = sys.argv[1]
    solution = solve_captcha(captcha_url)
    print(solution)
