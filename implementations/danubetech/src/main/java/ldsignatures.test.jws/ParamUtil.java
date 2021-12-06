package ldsignatures.test.jws;

public class ParamUtil {

    static boolean isCredentialCreate(String[] args, String format) {
        return args != null && "credential".equals(args[0]) && "create".equals(args[1]) && "vc".equals(format);
    }

    static boolean isCredentialCreateJwt(String[] args, String format) {
        return args != null && "credential".equals(args[0]) && "create".equals(args[1]) && "vc-jwt".equals(format);
    }

    static boolean isPresentationCreate(String[] args, String format) {
        return args != null && "presentation".equals(args[0]) && "create".equals(args[1]) && "vp".equals(format);
    }

    static boolean isPresentationCreateJwt(String[] args, String format) {
        return args != null && "presentation".equals(args[0]) && "create".equals(args[1]) && "vp-jwt".equals(format);
    }

    static String getParamValue(String[] args, String paramName) {
        for (int i=0; i<args.length-1; i++) {
            if (args[i].equals(paramName)) return args[i+1];
        }
        return null;
    }
}
