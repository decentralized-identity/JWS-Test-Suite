package ldsignatures.test.jws;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

public class FileUtil {

    static String readFile(String path) throws IOException {
        return path == null ? null : Files.readString(Paths.get(path));
    }

    static void writeFile(String path, String content) throws IOException {
        Files.createDirectories(Paths.get(path).getParent());
        Files.writeString(Paths.get(path), content, StandardCharsets.UTF_8);
    }
}
